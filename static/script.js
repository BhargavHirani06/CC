const converterForm = document.getElementById('converter-form');
const conversionType = document.getElementById('conversion-type');
const conversionInput = document.getElementById('conversion-input');
const inputFile = document.getElementById('input-file');
const output = document.getElementById('output');

converterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  output.classList.remove('animate__fadeIn');
  output.innerText = 'Converting...';

  const conversionTypeValue = conversionType.value;
  const inputFileValue = inputFile.files[0];

  if (!inputFileValue) {
    output.innerText = 'Please upload a file';
    return;
  }

  const formData = new FormData();
  formData.append('file', inputFileValue);

  let response;
  if (conversionTypeValue === 'speech-to-text') {
    response = await fetch('/speech-to-text', {
      method: 'POST',
      body: formData,
    });
    const jsonResponse = await response.json();
    const text = jsonResponse.text;
    output.innerText = text;
    download(jsonResponse.filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  } else if (conversionTypeValue === 'text-to-speech') {
    response = await fetch('/text-to-speech', {
      method: 'POST',
      body: formData,
    });
    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audioElement = document.createElement('audio');
    audioElement.src = audioUrl;
    audioElement.controls = true;
    output.innerHTML = '';
    output.appendChild(audioElement);
    download('output.mp3', audioUrl);
  }

  output.classList.add('animate__fadeIn');
});

function download(filename, url) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
}
