use std::env;
use tauri::State;
use std::sync::Mutex;

// State to hold the file path passed via command line
#[derive(Default)]
struct AppState {
    startup_file: Mutex<Option<String>>,
}

#[tauri::command]
fn get_app_info() -> String {
    "Markdown Viewer v0.1.0".to_string()
}

#[tauri::command]
fn get_startup_file(state: State<AppState>) -> Option<String> {
    let startup_file = state.startup_file.lock().unwrap();
    startup_file.clone()
}

#[tauri::command]
fn clear_startup_file(state: State<AppState>) {
    let mut startup_file = state.startup_file.lock().unwrap();
    *startup_file = None;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Get command line arguments
    let args: Vec<String> = env::args().collect();
    let startup_file = if args.len() > 1 {
        // Check if the argument is a markdown file
        let file_path = &args[1];
        if file_path.ends_with(".md") || file_path.ends_with(".markdown") {
            Some(file_path.clone())
        } else {
            None
        }
    } else {
        None
    };

    let app_state = AppState {
        startup_file: Mutex::new(startup_file),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            get_startup_file,
            clear_startup_file
        ])
        .setup(|_app| {
            // Optional: You can also handle file opening here if needed
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
