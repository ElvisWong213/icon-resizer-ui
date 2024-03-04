import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { once } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/dialog";
import { convertFileSrc } from "@tauri-apps/api/tauri";

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  const removeSelectedImage = () => {
    setSelectedImage("");
  };

  const selectImage = () => {
    let file = open({
      multiple: false,
      filters: [{
        name: "Image",
        extensions: ['png', 'jpeg']
      }]
    });
    file.then((url) => {
      if (url != null && !Array.isArray(url)) {
        setImage(url);
      }
    })
  };

  function setImage(url: string) {
    let src = convertFileSrc(url);
    setSelectedImage(src);
  }

  once('tauri://file-drop', event => {
    let urls: string[] = event.payload as string[];
    setImage(urls[0])
  });

  return (
    <div className="container">
      <div className="dropzone">
        {
          selectedImage == "" ?
          <div className="dropzone_text">
            <p>Drop image here or</p>
            <button type="button" onClick={selectImage}>select image</button>
          </div> :
          <img src={selectedImage} onClick={selectImage}/>
        }
      </div>
      <div className="buttons">
        <button type="button" onClick={removeSelectedImage}>Clear</button>
        <button type="button">Convert</button>
      </div>
    </div>
  );
}

export default App;
