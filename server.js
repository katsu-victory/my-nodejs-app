const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

console.log('Initializing the server...');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

console.log('Middleware and static files added...');

// Google Sheets API 認証設定
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const credentialsPath = 'credentials.json';

try {
    console.log('Reading credentials file...');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath));
    console.log('Credentials loaded.');
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('Google Sheets API initialized.');

    // スプレッドシートIDを設定
    const SPREADSHEET_ID = '1_JlR1uk7mCUNs6vlxv8VY-3lNWdHrg7HUYzQilWz7WA';

    // データをスプレッドシートに追加するエンドポイント
    app.post('/addData', async (req, res) => {
        console.log('POST request received at /addData');
        try {
            const { userId, date, count, fatigue, musclePain, breathlessness, course, suggestion, heartRate, rpe, feedback } = req.body;
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'シート1!A1',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[userId, date, count, fatigue, musclePain, breathlessness, course, suggestion, heartRate, rpe, feedback]],
                },
            });
            console.log('Data added to Google Sheets.');
            res.status(200).send({ message: 'Data added successfully!' });
        } catch (error) {
            console.error('Error writing to Google Sheets:', error);
            res.status(500).send({ error: 'Failed to add data to Google Sheets' });
        }
    });

    // データをスプレッドシートから取得するエンドポイント
    app.get('/fetchData', async (req, res) => {
        console.log('GET request received at /fetchData');
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'シート1!A1:K10',
            });
            const rows = response.data.values;
            if (rows.length) {
                console.log('Data retrieved from Google Sheets.');
                res.status(200).send({ data: rows });
            } else {
                console.log('No data found.');
                res.status(404).send({ error: 'No data found' });
            }
        } catch (error) {
            console.error('Error reading from Google Sheets:', error);
            res.status(500).send({ error: 'Failed to fetch data from Google Sheets' });
        }
    });

    // ルートエンドポイント
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error('Initialization failed:', error);
}
