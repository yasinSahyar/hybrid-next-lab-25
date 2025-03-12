import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MediaItem, UserLevel } from 'hybrid-types/DBTypes';
import promisePool from '@/lib/db';
import { MessageResponse } from 'hybrid-types/MessageTypes';
import CustomError from '@/classes/CustomError';
import { fetchData } from '@/lib/functions';

const uploadPath = process.env.UPLOAD_URL;

// Common SQL fragments
// if mediaItem is an image add '-thumb.png' to filename
// if mediaItem is not image add screenshots property with 5 thumbnails
// uploadPath needs to be passed to the query
// Example usage:
// ....execute(BASE_MEDIA_QUERY, [uploadPath, otherParams]);
const BASE_MEDIA_QUERY = `
  SELECT
    media_id,
    user_id,
    filename,
    filesize,
    media_type,
    title,
    description,
    created_at,
    CONCAT(base_url, filename) AS filename,
    CASE
      WHEN media_type LIKE '%image%'
      THEN CONCAT(base_url, filename, '-thumb.png')
      ELSE CONCAT(base_url, filename, '-animation.gif')
    END AS thumbnail,
    CASE
      WHEN media_type NOT LIKE '%image%'
      THEN (
        SELECT JSON_ARRAY(
          CONCAT(base_url, filename, '-thumb-1.png'),
          CONCAT(base_url, filename, '-thumb-2.png'),
          CONCAT(base_url, filename, '-thumb-3.png'),
          CONCAT(base_url, filename, '-thumb-4.png'),
          CONCAT(base_url, filename, '-thumb-5.png')
        )
      )
      ELSE NULL
    END AS screenshots
  FROM MediaItems,
       (SELECT ? AS base_url) AS vars
`;

const fetchAllMedia = async (
  page: number | undefined = undefined,
  limit: number | undefined = undefined,
): Promise<MediaItem[]> => {
  const offset = ((page || 1) - 1) * (limit || 10);
  const sql = `${BASE_MEDIA_QUERY}
    ${limit ? 'LIMIT ? OFFSET ?' : ''}`;
  const params = limit ? [uploadPath, limit, offset] : [uploadPath];
  const stmt = promisePool.format(sql, params);

  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(stmt);
  rows.reverse();
  return rows;
};

const fetchMediaById = async (id: number): Promise<MediaItem> => {
  const sql = `${BASE_MEDIA_QUERY}
              WHERE media_id=?`;
  const params = [uploadPath, id];
  const stmt = promisePool.format(sql, params);
  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(stmt);
  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND, 404);
  }
  return rows[0];
};

const postMedia = async (
  media: Omit<
    MediaItem,
    'media_id' | 'created_at' | 'thumbnail' | 'screenshots'
  >,
): Promise<MediaItem> => {
  const { user_id, filename, filesize, media_type, title, description } = media;
  const sql = `INSERT INTO MediaItems (user_id, filename, filesize, media_type, title, description)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [user_id, filename, filesize, media_type, title, description];
  const stmt = promisePool.format(sql, params);
  const [result] = await promisePool.execute<ResultSetHeader>(stmt);
  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_CREATED, 500);
  }
  return await fetchMediaById(result.insertId);
};

const putMedia = async (
  media: Pick<MediaItem, 'title' | 'description'>,
  id: number,
  user_id: number,
  user_level: UserLevel['level_name'],
): Promise<MediaItem> => {
  const sql =
    user_level === 'Admin'
      ? 'UPDATE MediaItems SET title = ?, description = ? WHERE media_id = ?'
      : 'UPDATE MediaItems SET title = ?, description = ? WHERE media_id = ? AND user_id = ?';

  const params =
    user_level === 'Admin'
      ? [media.title, media.description, id]
      : [media.title, media.description, id, user_id];

  const stmt = promisePool.format(sql, params);

  const [result] = await promisePool.execute<ResultSetHeader>(stmt);

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_UPDATED, 404);
  }

  return await fetchMediaById(id);
};

const checkOwnership = async (
  media_id: number,
  user_id: number,
): Promise<boolean> => {
  const sql = 'SELECT * FROM MediaItems WHERE media_id = ? AND user_id = ?';
  const params = [media_id, user_id];
  const stmt = promisePool.format(sql, params);

  const [rows] = await promisePool.execute<RowDataPacket[]>(stmt);
  return rows.length > 0;
};

const deleteMedia = async (
  media_id: number,
  user_id: number,
  token: string,
  level_name: UserLevel['level_name'],
): Promise<MessageResponse> => {
  const media = await fetchMediaById(media_id);

  if (!media) {
    return { message: 'Media not found' };
  }

  const isOwner = await checkOwnership(media_id, user_id);
  if (!isOwner && level_name !== 'Admin') {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_DELETED, 403);
  }

  media.filename = media?.filename.replace(
    process.env.UPLOAD_URL as string,
    '',
  );

  const connection = await promisePool.getConnection();

  await connection.beginTransaction();

  await connection.execute('DELETE FROM Likes WHERE media_id = ?;', [media_id]);

  await connection.execute('DELETE FROM Comments WHERE media_id = ?;', [
    media_id,
  ]);

  await connection.execute('DELETE FROM Ratings WHERE media_id = ?;', [
    media_id,
  ]);

  await connection.execute('DELETE FROM MediaItemTags WHERE media_id = ?;', [
    media_id,
  ]);

  const sql =
    level_name === 'Admin'
      ? connection.format('DELETE FROM MediaItems WHERE media_id = ?', [
          media_id,
        ])
      : connection.format(
          'DELETE FROM MediaItems WHERE media_id = ? AND user_id = ?',
          [media_id, user_id],
        );

  const [result] = await connection.execute<ResultSetHeader>(sql);

  if (result.affectedRows === 0) {
    return { message: 'Media not deleted' };
  }

  const options = {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  try {
    const deleteResult = await fetchData<MessageResponse>(
      `${process.env.UPLOAD_SERVER}/delete/${media.filename}`,
      options,
    );

    console.log('deleteResult', deleteResult);
  } catch (e) {
    console.error('deleteMedia file delete error:', (e as Error).message);
  }

  await connection.commit();

  return {
    message: 'Media item deleted',
  };
};

const fetchMediaByUserId = async (user_id: number): Promise<MediaItem[]> => {
  const sql = `${BASE_MEDIA_QUERY} WHERE user_id = ?`;
  const params = [uploadPath, user_id];
  const stmt = promisePool.format(sql, params);

  const [rows] = await promisePool.execute<RowDataPacket[] & MediaItem[]>(stmt);
  return rows;
};

const fetchMostLikedMedia = async (): Promise<MediaItem> => {
  // you could also use a view for this
  const sql = `${BASE_MEDIA_QUERY}
     WHERE media_id = (
       SELECT media_id FROM Likes
       GROUP BY media_id
       ORDER BY COUNT(*) DESC
       LIMIT 1
     )`;
  const params = [uploadPath];
  const stmt = promisePool.format(sql, params);

  const [rows] = await promisePool.execute<
    RowDataPacket[] & MediaItem[] & { likes_count: number }
  >(stmt);

  if (!rows.length) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND_LIKED, 404);
  }
  return rows[0];
};

export {
  fetchAllMedia,
  fetchMediaById,
  postMedia,
  deleteMedia,
  fetchMostLikedMedia,
  fetchMediaByUserId,
  putMedia,
};