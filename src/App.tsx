import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { once } from "@tauri-apps/api/event";
import { open, save } from "@tauri-apps/api/dialog";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { appCacheDir, homeDir } from "@tauri-apps/api/path";
import { readBinaryFile, writeBinaryFile } from "@tauri-apps/api/fs";

function App() {
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImagePath, setSelectedImagePath] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [startConverting, setStartConverting] = useState(false);

  async function convertImage() {
    setStartConverting(true);
    if (selectedImagePath == "") {
      setErrorMessage("No image selected");
      setStartConverting(false);
      return;
    }
    setErrorMessage("");
    let output = await appCacheDir().then((dir) =>
      dir.substring(0, dir.length - 1),
    );
    console.log(output);
    let exportFilePath = "";
    await invoke("convert_image", {
      inputPath: selectedImagePath,
      outputPath: output,
    })
      .then((url) => {
        if (typeof url === "string") {
          exportFilePath = url;
        }
      })
      .catch((error) => {
        setStartConverting(false);
        setErrorMessage(error);
        return;
      });
    console.log(exportFilePath);
    let zipFile = await readBinaryFile(exportFilePath, undefined);
    let homePath = await homeDir().catch((error) => {
      setStartConverting(false);
      setErrorMessage(error);
    });
    let savePath = await save({
      defaultPath: homePath + "/" + "output.zip",
      filters: [
        {
          name: "zip",
          extensions: ["zip"],
        },
      ],
    });
    if (savePath == null) {
      setStartConverting(false);
      return;
    }
    // console.log(zipFile.length);
    await writeBinaryFile(savePath, zipFile, undefined);
    setStartConverting(false);
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
          extensions: ["png", "jpeg", "jpg"],
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

  function isImage(urls: string[]): boolean {
    const imageFileExtensions = ["png", "jpeg", "jpg"];
    let file = urls[0].split(".");
    if (file.length < 2) {
      setErrorMessage("file is not valid");
      return false;
    }
    for (let index = 0; index < imageFileExtensions.length; index++) {
      const element = imageFileExtensions[index];
      if (file[1].includes(element)) {
        return true;
      }
    }
    return false;
  }

  once("tauri://file-drop", (event) => {
    let urls: string[] = event.payload as string[];
    if (isImage(urls)) {
      setImage(urls[0]);
    }
    const element = document.getElementById("dropzone");
    element?.classList.remove("dropzone_reject_file");
    element?.classList.remove("dropzone_accept_file");
  });

  once("tauri://file-drop-hover", (event) => {
    let urls: string[] = event.payload as string[];
    const element = document.getElementById("dropzone");
    if (isImage(urls)) {
      element?.classList.remove("dropzone_reject_file");
      element?.classList.add("dropzone_accept_file");
    } else {
      element?.classList.remove("dropzone_accept_file");
      element?.classList.add("dropzone_reject_file");
    }
  });

  return (
    <div className="container">
      <p>{errorMessage}</p>
      <div id="dropzone" className="dropzone">
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
        <button
          type="button"
          onClick={removeSelectedImage}
          disabled={startConverting}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={async () => {
            await convertImage();
          }}
          disabled={startConverting}
        >
          {startConverting ? "Loading..." : "Convert"}
        </button>
      </div>
    </div>
  );
}

export default App;
