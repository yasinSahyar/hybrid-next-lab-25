// src/models/mediaModel.ts
import promisePool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export interface QuestItem {
  quest_id: number;
  user_id: number;
  title: string;
  quest_text: string;
  reward_type: string;
  reward_count: number;
  repeat_count: number;
  is_done: boolean;
  is_public: boolean;
  created_at: string;
}

export const fetchOwnerMedia = async (user_id: number): Promise<QuestItem[]> => {
  try {
    console.log('fetchOwnerMedia çağrıldı, user_id:', user_id);
    const sql = `SELECT quest_id, title, quest_text, reward_type, reward_count, repeat_count, is_done, is_public, created_at FROM Quests WHERE user_id = ?`;
    const params = [user_id];
    const stmt = promisePool.format(sql, params);

    const [rows] = await promisePool.execute<RowDataPacket[] & QuestItem[]>(stmt);
    console.log('Sorgu sonucu:', rows);
    return rows;
  } catch (error) {
    console.error('Veritabanı hatası:', error);
    if ((error as any).code === 'ER_NO_SUCH_TABLE') {
      console.log('Quests tablosu bulunamadı, boş dizi döndürülüyor');
      return [];
    }
    throw error;
  }
};