class Editor {
    constructor(textarea) {
        this.mde = new SimpleMDE(textarea);
        this.slides = textarea.value.split(/\n\n---\n\n/);
        this.index = 0;
        this.mde.value(this.slides[this.index]);
    }
    left(){
        if (this.index === 0) return;
        this.slides[this.index] = this.mde.value();
        this.mde.value(this.slides[--this.index]);
    }
    right(){
        if (this.index === this.slides.length - 1) {
            this.slides.push('');
        }
        this.slides[this.index] = this.mde.value();
        this.mde.value(this.slides[++this.index]);
    }
    save(){
        this.slides[this.index] = this.mde.value();
        let id = document.getElementById('id').value;
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/save", true);
        xhr.setRequestHeader('Content-type', 'application/json');
        let body = JSON.stringify({
            id: id,
            text: this.slides.join('\n\n---\n\n')
        });
        xhr.onload = () => {
            if (xhr.status === 200) {
                alert('Presentation has been saved');
            } else {
                alert(xhr.status);
            }
        };
        xhr.send(body);
    }
    view(){
        let id = document.getElementById('id').value;
        window.open('/view?id=' + id);
    }
    delete(){
        let id = document.getElementById('id').value;
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/delete", true);
        xhr.setRequestHeader('Content-type', 'application/json');
        let body = JSON.stringify({
            id: id
        });
        xhr.onload = () => {
            window.location.href = xhr.responseURL;
        };
        xhr.send(body);
    }
}
