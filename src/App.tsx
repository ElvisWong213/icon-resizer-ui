import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { once } from "@tauri-apps/api/event";
import { open, save } from "@tauri-apps/api/dialog";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { appCacheDir, downloadDir } from "@tauri-apps/api/path";
import { readBinaryFile, writeBinaryFile } from "@tauri-apps/api/fs";

function App() {
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImagePath, setSelectedImagePath] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [exportFilePath, setExportFilePath] = useState("");

  async function convertImage() {
    if (selectedImagePath == "") {
      setErrorMessage("No image selected");
      return;
    }
    setErrorMessage("");
    let output = await appCacheDir().then((dir) =>
      dir.substring(0, dir.length - 1),
    );
    console.log(output);
    await invoke("convert_image", {
      inputPath: selectedImagePath,
      outputPath: output,
    })
      .then((url) => {
        if (typeof url === "string") {
          setExportFilePath(url);
        }
      })
      .catch((error) => setErrorMessage(error));
    // console.log(exportFilePath);
    let zipFile = await readBinaryFile(exportFilePath, undefined);
    let downloadPath = await downloadDir();
    let savePath = await save({
      defaultPath: downloadPath + "/" + "output.zip",
      filters: [
        {
          name: "zip",
          extensions: ["zip"],
        },
      ],
    });
    if (savePath == null) {
      return;
    }
    // console.log(zipFile.length);
    await writeBinaryFile(savePath, zipFile, undefined);
  }

  const removeSelectedImage = () => {
    setSelectedImage("");
    setSelectedImagePath("");
  };

  const selectImage = () => {
    let file = open({
      multiple: false,
      filters: [
        {
          name: "Image",
          extensions: ["png", "jpeg"],
        },
      ],
    });
    file.then((url) => {
      if (url != null && !Array.isArray(url)) {
        setImage(url);
      }
    });
  };

  function setImage(url: string) {
    let src = convertFileSrc(url);
    setSelectedImage(src);
    setSelectedImagePath(url);
  }

  once("tauri://file-drop", (event) => {
    let urls: string[] = event.payload as string[];
    setImage(urls[0]);
  });

  return (
    <div className="container">
      <p>{errorMessage}</p>
      <div className="dropzone">
        {selectedImage == "" ? (
          <div className="dropzone_text">
            <p>Drop image here or</p>
            <button type="button" onClick={selectImage}>
              select image
            </button>
          </div>
        ) : (
          <img src={selectedImage} onClick={selectImage} />
        )}
      </div>
      <div className="buttons">
        <button type="button" onClick={removeSelectedImage}>
          Clear
        </button>
        <button
          type="button"
          onClick={async () => {
            await convertImage();
          }}
        >
          Convert
        </button>
      </div>
    </div>
  );
}

export default App;
