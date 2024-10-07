function sendMessage() {
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');

    if (userInput.value.trim() === '') return;

    chatMessages.innerHTML += `<p><strong>You:</strong> ${userInput.value}</p>`;

    fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput.value }),
    })
    .then(response => response.json())
    .then(data => {
        chatMessages.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    })
    .catch(error => console.error('Error:', error));

    userInput.value = '';
}

document.getElementById('user-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});