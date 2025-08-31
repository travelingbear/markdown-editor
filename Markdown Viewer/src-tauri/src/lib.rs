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

#[tauri::command]
fn open_file_direct(file_path: String) -> Result<String, String> {
    println!("[Rust] Direct file open requested: {}", file_path);
    match std::fs::read_to_string(&file_path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e))
    }
}

#[tauri::command]
fn debug_command_line() -> Vec<String> {
    let args: Vec<String> = env::args().collect();
    println!("[Rust] Debug - Current command line args: {:?}", args);
    args
}

#[tauri::command]
fn test_file_association(test_file: String) -> Result<String, String> {
    println!("[Rust] Testing file association with: {}", test_file);
    
    let path = std::path::Path::new(&test_file);
    if path.exists() {
        match std::fs::read_to_string(&test_file) {
            Ok(content) => {
                println!("[Rust] Successfully read test file, length: {}", content.len());
                Ok(format!("File read successfully! Length: {} characters", content.len()))
            }
            Err(e) => {
                let error_msg = format!("Failed to read file: {}", e);
                println!("[Rust] {}", error_msg);
                Err(error_msg)
            }
        }
    } else {
        let error_msg = format!("File does not exist: {}", test_file);
        println!("[Rust] {}", error_msg);
        Err(error_msg)
    }
}

#[tauri::command]
fn convert_local_image_path(file_path: String) -> Result<String, String> {
    println!("[Rust] Converting local image path: '{}'", file_path);
    println!("[Rust] Path length: {}", file_path.len());
    
    let path = std::path::Path::new(&file_path);
    println!("[Rust] Path exists: {}", path.exists());
    println!("[Rust] Path is absolute: {}", path.is_absolute());
    
    // Check if it's already a URL (http/https)
    if file_path.starts_with("http://") || file_path.starts_with("https://") {
        return Ok(file_path);
    }
    
    // Check if file exists
    if !path.exists() {
        return Err(format!("Image file does not exist: {}", file_path));
    }
    
    // Read the file and convert to data URL
    match std::fs::read(&file_path) {
        Ok(bytes) => {
            // Determine MIME type based on file extension
            let mime_type = match path.extension().and_then(|ext| ext.to_str()) {
                Some("png") => "image/png",
                Some("jpg") | Some("jpeg") => "image/jpeg",
                Some("gif") => "image/gif",
                Some("webp") => "image/webp",
                Some("svg") => "image/svg+xml",
                Some("bmp") => "image/bmp",
                Some("ico") => "image/x-icon",
                _ => "image/png", // Default fallback
            };
            
            // Convert to base64
            use base64::{Engine as _, engine::general_purpose};
            let base64_data = general_purpose::STANDARD.encode(&bytes);
            let data_url = format!("data:{};base64,{}", mime_type, base64_data);
            
            println!("[Rust] Converted to data URL (length: {})", data_url.len());
            Ok(data_url)
        }
        Err(e) => {
            Err(format!("Failed to read image file: {}", e))
        }
    }
}

#[tauri::command]
fn get_dropped_file_absolute_path(file_name: String, content: Vec<u8>) -> Result<String, String> {
    use std::io::Write;
    
    // Create temp file to get system path
    let temp_dir = std::env::temp_dir();
    let temp_path = temp_dir.join(&file_name);
    
    // Write content and get the absolute path
    match std::fs::File::create(&temp_path) {
        Ok(mut file) => {
            if let Err(e) = file.write_all(&content) {
                return Err(format!("Failed to write file: {}", e));
            }
            
            // Try to find the original file in common locations
            let search_paths = vec![
                dirs::desktop_dir(),
                dirs::document_dir(), 
                dirs::download_dir(),
                dirs::home_dir(),
                std::env::current_dir().ok(),
            ];
            
            for base_dir in search_paths.into_iter().flatten() {
                let candidate_path = base_dir.join(&file_name);
                if candidate_path.exists() {
                    if let Ok(existing_content) = std::fs::read(&candidate_path) {
                        if existing_content == content {
                            // Found matching file, return its path
                            if let Some(path_str) = candidate_path.to_str() {
                                // Clean up temp file
                                let _ = std::fs::remove_file(&temp_path);
                                return Ok(path_str.to_string());
                            }
                        }
                    }
                }
            }
            
            // No matching file found, return temp path
            if let Some(path_str) = temp_path.to_str() {
                Ok(path_str.to_string())
            } else {
                Err("Failed to get path string".to_string())
            }
        }
        Err(e) => Err(format!("Failed to create temp file: {}", e))
    }
}

#[tauri::command]
fn get_absolute_paths_from_names(file_names: Vec<String>) -> Result<Vec<String>, String> {
    println!("[Rust] Getting absolute paths for: {:?}", file_names);
    
    let mut absolute_paths = Vec::new();
    
    for file_name in file_names {
        println!("[Rust] Processing file: {}", file_name);
        
        // Search in common locations
        let search_paths = vec![
            std::env::current_dir().ok(),
            dirs::desktop_dir(),
            dirs::document_dir(),
            dirs::download_dir(),
            dirs::home_dir(),
        ];
        
        let mut found_path = None;
        for base_dir in search_paths.into_iter().flatten() {
            let full_path = base_dir.join(&file_name);
            println!("[Rust] Checking: {}", full_path.display());
            if full_path.exists() {
                if let Some(path_str) = full_path.to_str() {
                    found_path = Some(path_str.to_string());
                    println!("[Rust] Found at: {}", path_str);
                    break;
                }
            }
        }
        
        match found_path {
            Some(path) => absolute_paths.push(path),
            None => {
                println!("[Rust] File not found, using name: {}", file_name);
                absolute_paths.push(file_name);
            }
        }
    }
    
    println!("[Rust] Final absolute paths: {:?}", absolute_paths);
    Ok(absolute_paths)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Get command line arguments
    let args: Vec<String> = env::args().collect();
    println!("[Rust] Command line args: {:?}", args);
    println!("[Rust] Total args count: {}", args.len());
    
    // Log each argument for debugging
    for (i, arg) in args.iter().enumerate() {
        println!("[Rust] Arg[{}]: '{}'", i, arg);
    }
    
    let startup_file = if args.len() > 1 {
        // Look for the first file argument (skip program name)
        let mut found_file = None;
        
        for arg in args.iter().skip(1) {
            println!("[Rust] Processing argument: '{}'", arg);
            
            // Skip common flags and options
            if arg.starts_with("-") || arg.starts_with("/") {
                println!("[Rust] Skipping flag/option: {}", arg);
                continue;
            }
            
            // Check if it's a supported file extension
            let arg_lower = arg.to_lowercase();
            if arg_lower.ends_with(".md") || arg_lower.ends_with(".markdown") || arg_lower.ends_with(".txt") {
                println!("[Rust] Found potential file: {}", arg);
                
                // Try to resolve the path
                let path = std::path::Path::new(arg);
                
                if path.exists() {
                    println!("[Rust] File exists: {}", arg);
                    found_file = Some(arg.clone());
                    break;
                } else {
                    println!("[Rust] File does not exist, trying absolute path resolution");
                    
                    // Try to resolve as absolute path
                    match path.canonicalize() {
                        Ok(canonical_path) => {
                            let canonical_str = canonical_path.to_string_lossy().to_string();
                            println!("[Rust] Resolved to canonical path: {}", canonical_str);
                            found_file = Some(canonical_str);
                            break;
                        }
                        Err(_) => {
                            // Try relative to current directory
                            match std::env::current_dir() {
                                Ok(current_dir) => {
                                    let full_path = current_dir.join(arg);
                                    if full_path.exists() {
                                        let full_path_str = full_path.to_string_lossy().to_string();
                                        println!("[Rust] Found file relative to current dir: {}", full_path_str);
                                        found_file = Some(full_path_str);
                                        break;
                                    } else {
                                        println!("[Rust] File not found relative to current dir either");
                                    }
                                }
                                Err(e) => {
                                    println!("[Rust] Could not get current directory: {}", e);
                                }
                            }
                        }
                    }
                }
            } else {
                println!("[Rust] Unsupported file extension: {}", arg);
            }
        }
        
        found_file
    } else {
        println!("[Rust] No command line arguments provided");
        None
    };
    
    println!("[Rust] Final startup_file: {:?}", startup_file);

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
            clear_startup_file,
            open_file_direct,
            debug_command_line,
            test_file_association,
            convert_local_image_path,
            get_absolute_paths_from_names,
            get_dropped_file_absolute_path
        ])
        .setup(|_app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
