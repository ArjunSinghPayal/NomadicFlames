function updateFileLabel(input) {
  const label = document.getElementById("fileLabel");
  if (input.files.length === 0) {
    label.textContent = "Choose image(s)...";
  } else if (input.files.length === 1) {
    label.textContent = `Selected: ${input.files[0].name}`;
  } else {
    label.textContent = `Selected: ${input.files.length} files`;
  }
}

function clearFiles() {
  const fileInput = document.getElementById("image");
  const label = document.getElementById("fileLabel");

  fileInput.value = "";
  label.textContent = "Choose image(s)...";
}

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("image");
  const clearBtn = document.getElementById("clearButton");

  if (fileInput) {
    fileInput.addEventListener("change", () => updateFileLabel(fileInput));
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearFiles);
  }
});
