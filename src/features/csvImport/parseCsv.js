import Papa from "papaparse";

function parse(file, options) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      ...options,
      complete: (result) => resolve({ headers: result.meta.fields ?? [], rows: result.data }),
      error: reject,
    });
  });
}

export function parseCsvPreview(file, previewRows = 20) {
  return parse(file, { preview: previewRows });
}

export function parseCsvFull(file) {
  return parse(file, {});
}
