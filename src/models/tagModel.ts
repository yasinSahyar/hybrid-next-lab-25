// src/models/tagModel.ts
import { ERROR_MESSAGES } from '@/utils/errorMessages';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MediaItem, Tag, TagResult } from 'hybrid-types/DBTypes';
import promisePool from '@/lib/db';
import { MessageResponse } from 'hybrid-types/MessageTypes';
import CustomError from '@/classes/CustomError';

const uploadPath = process.env.UPLOAD_URL || 'http://localhost:3000/uploads/';

const BASE_MEDIA_QUERY = `
  SELECT
    MediaItems.media_id,
    user_id,
    filename,
    filesize,
    media_type,
    title,
    description,
    created_at,
    CONCAT(?, filename) AS filename,
    CASE
      WHEN media_type LIKE '%image%'
      THEN CONCAT(?, filename, '-thumb.png')
      ELSE CONCAT(?, filename, '-animation.gif')
    END AS thumbnail,
    CASE
      WHEN media_type NOT LIKE '%image%'
      THEN (
        SELECT JSON_ARRAY(
          CONCAT(?, filename, '-thumb-1.png'),
          CONCAT(?, filename, '-thumb-2.png'),
          CONCAT(?, filename, '-thumb-3.png'),
          CONCAT(?, filename, '-thumb-4.png'),
          CONCAT(?, filename, '-thumb-5.png')
        )
      )
      ELSE NULL
    END AS screenshots
  FROM MediaItems
  LEFT JOIN MediaItemTags ON MediaItems.media_id = MediaItemTags.media_id
  LEFT JOIN Tags ON MediaItemTags.tag_id = Tags.tag_id
`;

export async function fetchMediaByTagName(tagName: string): Promise<MediaItem[] | null> {
  try {
    const [rows] = await promisePool.execute<RowDataPacket[]>(
      `${BASE_MEDIA_QUERY} WHERE Tags.tag_name = ?`,
      [uploadPath, uploadPath, uploadPath, uploadPath, uploadPath, uploadPath, uploadPath, uploadPath, tagName]
    );
    if (!rows.length) return null;

    const mediaItems: MediaItem[] = rows.map((row) => ({
      media_id: row.media_id,
      user_id: row.user_id,
      filename: row.filename,
      filesize: row.filesize,
      media_type: row.media_type,
      title: row.title,
      description: row.description,
      created_at: row.created_at,
      thumbnail: row.thumbnail,
      screenshots: row.screenshots ? JSON.parse(row.screenshots) : null,
    }));

    return mediaItems;
  } catch (error) {
    console.error('Error fetching media by tag:', (error as Error).message);
    throw new CustomError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
}

export async function fetchTagsByMediaId(mediaId: number): Promise<Tag[]> {
  try {
    const [rows] = await promisePool.execute<RowDataPacket[]>(
      `SELECT Tags.tag_id, Tags.tag_name 
       FROM Tags 
       JOIN MediaItemTags ON Tags.tag_id = MediaItemTags.tag_id 
       WHERE MediaItemTags.media_id = ?`,
      [mediaId]
    );
    return rows as Tag[];
  } catch (error) {
    console.error('Error fetching tags by media ID:', (error as Error).message);
    throw new CustomError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
}