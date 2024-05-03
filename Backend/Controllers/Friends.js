import { db } from "../connect.js"
import bcrypt from "bcryptjs";
import sql from "mssql";
import Express from "express"



// Fetch list of friends for the logged-in user
export const FriendsList =  async (req, res) => {
    const userId = req.params.userId;
    //console.log(userId);
    try {
        //const pool = await sql.connect(config);
        const request = db.request();
        const result = await request.input('userId', sql.Int, userId)
            .query(`SELECT u.user_id, u.username, u.profile_picture
                    FROM Friends f
                    INNER JOIN Users u ON f.friend_id_2 = u.user_id
                    WHERE f.friend_id_1 = @userId
                    UNION
                    SELECT u.user_id, u.username, u.profile_picture
                    FROM Friends f
                    INNER JOIN Users u ON f.friend_id_1 = u.user_id
                    WHERE f.friend_id_2 = @userId`);
                    //console.log(result.recordset);
        return res.json(result.recordset);

    } catch (error) {
        console.error('Error fetching friends:', error);
       return res.status(500).json({ error: 'Internal server error' });
    }
};

