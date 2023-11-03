async function getCompletion(text) {
    console.log("PARTIENDO...");
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": text
                }]
        })
    })
    const data = await res.json();
    console.log("VAMOS", data);
}