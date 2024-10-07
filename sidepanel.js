document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const loadingElement = document.getElementById('loading');
    const contentArea = document.getElementById('content-area');
    const chatMessages = document.getElementById("chat-messages");
    
    const summary = document.getElementById("summary");
    const chat = document.getElementById("chat");
    const summaryLink = document.getElementById("summary-link");
    const chatLink = document.getElementById("chat-link");

    summaryLink.addEventListener('click', (e)=>{
        e.preventDefault();
        chatLink.classList.remove('active');
        summaryLink.classList.add('active');
        summary.style.display = 'block';
        chat.style.display='none';
    })

    chatLink.addEventListener('click', (e)=>{
        e.preventDefault();
        chatLink.classList.add('active');
        summaryLink.classList.remove('active');
        summary.style.display = 'none';
        chat.style.display = 'block';
    })
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        const link = e.dataTransfer.getData('text/plain');
        if (link) {
            console.log('Dropped link:', link);
            fetchContent(`http://localhost:5000/analyze?url=${link}`);
        }
    });

    async function fetchContent(url) {
        loadingElement.classList.remove('d-none');
        contentArea.innerHTML = '';

        try {
            const response = await fetch(url);
            const html = await response.text();
            
            console.log('Fetched HTML:', html);
            
            loadingElement.classList.add('d-none');
            contentArea.innerHTML = html;
        } catch (error) {
            console.error('Error fetching content:', error);
            loadingElement.classList.add('d-none');
            contentArea.innerHTML = `<p class="text-danger">Error fetching content: ${error.message}</p>`;
        }
    }
});