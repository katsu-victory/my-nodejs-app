async function getUserCount(userId) {
    try {
        const response = await fetch(`https://script.google.com/macros/s/AKfycbz79oGePfyJPMoP_I5gwiwfHEHcz9PcrBa4RhRO_yg9vr-7u5VYicAxQkdf569sYwvs/exec?userId=${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.count || 1;
    } catch (error) {
        console.error("カウントデータの取得中にエラーが発生しました:", error);
        return 1;
    }
}

async function suggestAndSubmit(event) {
    event.preventDefault();

    const userId = document.getElementById("userId").value;
    const count = parseInt(document.getElementById("userCount").value);
    if (!userId || isNaN(count)) {
        alert("ユーザーIDとカウントを入力してください。");
        return;
    }

    const symptoms = [
        document.querySelector('input[name="fatigue"]:checked').value,
        document.querySelector('input[name="muscle_pain"]:checked').value,
        document.querySelector('input[name="breathlessness"]:checked').value
    ];

    let course;
    if (count >= 1 && count <= 3) course = 1;
    else if (count >= 4 && count <= 6) course = 2;
    else if (count >= 7 && count <= 9) course = 3;
    else if (count >= 10 && count <= 12) course = 4;
    else if (count >= 13 && count <= 15) course = 5;
    else course = 6;

    let stopExercise = false;
    symptoms.forEach(value => {
        if (value === '重度') stopExercise = true;
        else if (value === '中程度') course = Math.max(course - 2, 1);
        else if (value === '軽度') course = Math.max(course - 1, 1);
    });

    const programSuggestion = document.getElementById('program-suggestion');
    if (stopExercise) {
        programSuggestion.innerHTML = "運動中止が推奨されます。体調を整えてから再開しましょう。";
    } else {
        const courseLinks = {
            1: {
                video1: "https://www.youtube.com/embed/vvoh9yFWjY8",
                description1: "コース1はその場でスクワットを行います。<br>心拍数を意識して行いましょう。",
                video3: "https://www.youtube.com/embed/6D6A6FTxK58",
                description2: "シンプルな運動ですが、心拍数を上げることを意識しましょう。"
            },
            2: {
                video1: "https://www.youtube.com/embed/vvoh9yFWjY8",
                video2: "https://www.youtube.com/embed/L3HoW5aH1b0",
                description1: "コース2はスクワットとフロントランジを行います。",
                video3: "https://www.youtube.com/embed/esmG0gBu6XA",
                description2: "フロントランジはバランスに気を付けて行いましょう。"
            },
            3: {
                video1: "https://www.youtube.com/embed/lHwCOokLt1Q",
                video2: "https://www.youtube.com/embed/NX9STcriOLw",
                description1: "コース3はスクワット+フロントランジとスケーターズランジを行います。",
                video3: "https://www.youtube.com/embed/l8tC6trfXsw",
                description2: "スケーターズランジはバランスに気を付けて行いましょう。"
            },
            4: {
                video1: "https://www.youtube.com/embed/lHwCOokLt1Q",
                video2: "https://www.youtube.com/embed/cth6_ZT_Atc",
                description1: "コース4はスクワット+フロントランジとスケーターズランジを行います。",
                video3: "https://www.youtube.com/embed/c0zrjIvGO7Q",
                description2: "ジャンプして着地する際は、真っ直ぐ着地して、バランスを取りましょう。"
            },
            5: {
                video1: "https://www.youtube.com/embed/7vOnajWFnhQ",
                video2: "https://www.youtube.com/embed/cth6_ZT_Atc",
                description1: "コース5はスクワットスラストとスケーターズランジを行います。",
                video3: "https://www.youtube.com/embed/eeYbg324mzE",
                description2: "膝の曲げ伸ばしに気を付けて行いましょう。"
            },
            6: {
                video1: "https://www.youtube.com/embed/WdTU-oJQDOI",
                video2: "https://www.youtube.com/embed/cth6_ZT_Atc",
                description1: "コース6はバーピーとスケーターズランジを行います。",
                video3: "https://www.youtube.com/embed/DZxHenXtZUY",
                description2: "膝と腰の曲げ伸ばしに気を付けて行いましょう。"
            }
        };

        const selectedCourse = courseLinks[course];
        programSuggestion.innerHTML = `
            <p style="font-size: 18px; font-weight: bold; color: #333;">本日の運動プログラム: コース ${course}</p>
            <p style="font-size: 16px; color: #555;">${selectedCourse.description1}</p>
            <div class="video-container"><iframe width="560" height="315" src="${selectedCourse.video1}" frameborder="0" allowfullscreen></iframe></div>
            ${selectedCourse.video2 ? `<div class="video-container"><iframe width="560" height="315" src="${selectedCourse.video2}" frameborder="0" allowfullscreen></iframe></div>` : ''}
            <p style="font-size: 16px; color: #555;">${selectedCourse.description2}</p>
            ${selectedCourse.video3 ? `<div class="video-container"><iframe width="560" height="315" src="${selectedCourse.video3}" frameborder="0" allowfullscreen></iframe></div>` : ''}
        `;
    }

    // フィードバックフォームを表示する
    document.getElementById("initial-section").style.display = "none";
    document.getElementById("suggestForm").style.display = "none";
    document.getElementById("feedback-form").style.display = "block";

    const exerciseDateData = {
        type: "exercise_date",
        userId: userId,
        userCount: count,
        fatigue: symptoms[0],
        muscle_pain: symptoms[1],
        breathlessness: symptoms[2],
        suggestedCourse: course
    };

    try {
        await fetch("https://script.google.com/macros/s/AKfycbz79oGePfyJPMoP_I5gwiwfHEHcz9PcrBa4RhRO_yg9vr-7u5VYicAxQkdf569sYwvs/exec", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify(exerciseDateData)
        });
    } catch (error) {
        console.error("データ送信中にエラーが発生しました:", error);
        alert("データ送信中にエラーが発生しました。");
    }
}

function submitFeedback() {
    const userId = document.getElementById("userId").value;
    const heartRate = document.getElementById("heartRate").value;
    const RPE = document.getElementById("RPE").value;
    const feedback = document.getElementById("feedback").value;

    const feedbackData = {
        type: "feedback",
        heartRate: heartRate,
        RPE: RPE,
        feedback: feedback,
        userId: userId
    };

    fetch("https://script.google.com/macros/s/AKfycbz79oGePfyJPMoP_I5gwiwfHEHcz9PcrBa4RhRO_yg9vr-7u5VYicAxQkdf569sYwvs/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify(feedbackData)
    })
    .then(response => {
        console.log("フィードバックが送信されました。");

        // すべての画面要素を非表示に
        document.getElementById("program-suggestion").style.display = "none";
        document.getElementById("feedback-form").style.display = "none";

        // 「お疲れ様でした。」のメッセージを表示
        const completionMessage = document.createElement("p");
        completionMessage.textContent = "お疲れ様でした。";
        completionMessage.style.fontSize = "24px";
        completionMessage.style.fontWeight = "bold";
        document.body.appendChild(completionMessage);
    })
    .catch(error => console.error("フィードバック送信中にエラーが発生しました:", error));
}
async function fetchUserData(userId) {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbz79oGePfyJPMoP_I5gwiwfHEHcz9PcrBa4RhRO_yg9vr-7u5VYicAxQkdf569sYwvs/exec", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            mode: 'no-cors',
            body: JSON.stringify({
                type: "fetch_user_data",
                userId: userId
            })
        });

        const data = await response.json();

        if (data.message === "No data found for the given userId") {
            console.log("データが見つかりませんでした。");
        } else {
            console.log("ユーザー情報:", data);
            document.getElementById("exerciseCount").innerText = `前回の実施回数: ${data.exerciseCount}`;
            document.getElementById("heartRate").innerText = `前回の心拍数: ${data.heartRate}`;
            document.getElementById("RPE").innerText = `前回のRPE: ${data.RPE}`;
        }
    } catch (error) {
        console.error("ユーザーデータの取得中にエラーが発生しました:", error);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const fetchDataBtn = document.getElementById("fetchDataBtn");
    const userIdInput = document.getElementById("userId");

    // データ取得ボタンのクリックイベント
    if (fetchDataBtn && userIdInput) {
        fetchDataBtn.onclick = function() {
            const userId = userIdInput.value;
            if (userId) {
                fetchUserData(userId);
            } else {
                alert("ユーザーIDが入力されていません。");
            }
        };
    } else {
        console.error("HTML要素が見つかりません: fetchDataBtnまたはuserIdInputが存在しません。");
    }
});
