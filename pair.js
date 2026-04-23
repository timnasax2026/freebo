<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toxic-Mini-Bot | Pairing</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --bg: #0f172a;
            --card: #1e293b;
            --primary: #3b82f6;
            --text: #f8fafc;
            --success: #10b981;
        }

        body {
            font-family: 'Segoe UI', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }

        .container {
            background: var(--card);
            padding: 2rem;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            width: 90%;
            max-width: 400px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .logo {
            font-size: 3rem;
            color: var(--primary);
            margin-bottom: 1rem;
        }

        input {
            width: 100%;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 0.75rem;
            border: 2px solid #334155;
            background: #0f172a;
            color: white;
            font-size: 1.1rem;
            outline: none;
            text-align: center;
        }

        input:focus { border-color: var(--primary); }

        button {
            width: 100%;
            padding: 1rem;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 0.75rem;
            font-weight: bold;
            cursor: pointer;
            font-size: 1rem;
            transition: 0.3s;
        }

        button:hover { opacity: 0.9; transform: translateY(-2px); }

        #result {
            display: none;
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: rgba(16, 185, 129, 0.1);
            border: 1px dashed var(--success);
            border-radius: 1rem;
        }

        .pairing-code {
            font-family: monospace;
            font-size: 2rem;
            color: var(--success);
            letter-spacing: 5px;
            margin: 10px 0;
            font-weight: bold;
        }

        .loader {
            display: none;
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 1rem auto;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>

<div class="container">
    <div class="logo"><i class="fas fa-robot"></i></div>
    <h2>Toxic-Mini Bot</h2>
    <p style="color: #94a3b8;">Ingiza namba ya simu upate kodi</p>

    <div id="input-area">
        <input type="tel" id="number" placeholder="Mfano: 254735342808">
        <button onclick="getCode()" id="btn-text">PATA KODI</button>
    </div>

    <div class="loader" id="loader"></div>

    <div id="result">
        <p>Kodi yako ni:</p>
        <div class="pairing-code" id="pair-code">--------</div>
        <button onclick="copyCode()" style="background: #475569; margin-top: 10px;">NAKILI KODI (COPY)</button>
        <p style="font-size: 0.8rem; margin-top: 10px; color: #94a3b8;">Nenda WhatsApp > Linked Devices > Link with phone number</p>
    </div>
</div>

<script>
    async function getCode() {
        const number = document.getElementById('number').value.replace(/[^0-9]/g, '');
        if (!number || number.length < 10) return alert("Weka namba kamili!");

        document.getElementById('btn-text').style.display = 'none';
        document.getElementById('loader').style.display = 'block';

        try {
            // Tunaita API ya /code tuliyotengeneza kwenye index.js
            const response = await fetch(`/code?number=${number}`);
            const data = await response.json();

            if (data.code) {
                document.getElementById('loader').style.display = 'none';
                document.getElementById('result').style.display = 'block';
                document.getElementById('pair-code').innerText = data.code;
            } else {
                alert("Imeshindwa: " + (data.error || "Jaribu tena"));
                location.reload();
            }
        } catch (err) {
            alert("Server Error! Hakikisha ume-deploy vizuri.");
            location.reload();
        }
    }

    function copyCode() {
        const code = document.getElementById('pair-code').innerText;
        navigator.clipboard.writeText(code);
        alert("Kodi imenakiliwa!");
    }
</script>

</body>
</html>
