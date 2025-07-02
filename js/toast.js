document.addEventListener('DOMContentLoaded', () => {
    const emailLink = document.getElementById('email-link');
    const toast = document.getElementById('toast');
    const address = emailLink.href.replace(/^mailto:/, '');

    async function showToast() {
        toast.classList.add('show');
        await new Promise(r => setTimeout(r, 1600));
        toast.classList.remove('show');
    }

    emailLink.addEventListener('click', async e => {
        // copy to clipboard
        try {
            await navigator.clipboard.writeText(address);
        } catch (_) {
            // fallback for older browsers
            const tmp = document.createElement('textarea');
            tmp.value = address;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            tmp.remove();
        }

        // show confirmation
        showToast();

        // note: we do NOT preventDefault here,
        // so mailto: will still fire if supported.
    });
});