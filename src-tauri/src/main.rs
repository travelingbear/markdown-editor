#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, Window};
use std::fs;

#[tauri::command]
async fn open_file(window: Window) -> Result<(String, String), String> {
    let file_path = tauri::api::dialog::FileDialogBuilder::new()
        .add_filter("Markdown", &["md", "markdown"])
        .pick_file()
        .await;
    
    match file_path {
        Some(path) => {
            let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
            let filename = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("Untitled")
                .to_string();
            Ok((content, filename))
        }
        None => Err("No file selected".to_string())
    }
}

#[tauri::command]
async fn save_file(content: String, window: Window) -> Result<String, String> {
    let file_path = tauri::api::dialog::FileDialogBuilder::new()
        .set_file_name("document.md")
        .add_filter("Markdown", &["md", "markdown"])
        .save_file()
        .await;
        
    match file_path {
        Some(path) => {
            fs::write(&path, content).map_err(|e| e.to_string())?;
            let filename = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("Untitled")
                .to_string();
            Ok(filename)
        }
        None => Err("Save cancelled".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_file, save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}