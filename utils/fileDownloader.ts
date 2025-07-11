
export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  document.body.appendChild(a); // Required for Firefox
  a.click();
  URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
};
