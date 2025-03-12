// src/models/mediaModel.ts
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MediaItem, UserLevel } from 'hybrid-types/DBTypes';
import promisePool from '@/lib/db';
import { MessageResponse } from 'hybrid-types/MessageTypes';
import CustomError from '@/classes/CustomError';
import { ERROR_MESSAGES } from '@/utils/errorMessages';

const uploadPath = process.env.UPLOAD_URL || 'http://localhost:3000/uploads/';

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

// Other functions remain the same...