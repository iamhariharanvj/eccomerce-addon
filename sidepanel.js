document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const loadingElement = document.getElementById('loading');
    const contentArea = document.getElementById('content-area');

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