// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use icon_image::ImageProcess;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command(async)]
fn convert_image(input_path: String, output_path: String) -> Result<String, String> {
   let mut process = ImageProcess::new(input_path, output_path);
   match process.run() {
       Ok(path) => Ok(path),
       Err(error) => Err(error.to_string())
   }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![convert_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
