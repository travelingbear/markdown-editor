use std::env;
use tauri::{State, Manager, Emitter, Listener, menu::{MenuBuilder, SubmenuBuilder, MenuItemBuilder}, AppHandle, RunEvent, WindowEvent};
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
    match std::fs::read_to_string(&file_path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e))
    }
}

#[tauri::command]
fn debug_command_line() -> Vec<String> {
    let args: Vec<String> = env::args().collect();
    args
}

#[tauri::command]
fn debug_file_open_status(state: State<AppState>) -> String {
    let startup_file = state.startup_file.lock().unwrap();
    match &*startup_file {
        Some(file) => format!("File open event file: {}", file),
        None => "No file from file open event".to_string()
    }
}

#[tauri::command]
fn force_check_startup_file(state: State<AppState>) -> Option<String> {
    let startup_file = state.startup_file.lock().unwrap();
    startup_file.clone()
}

#[tauri::command]
fn test_manual_file_association(app: tauri::AppHandle, test_file: String) -> Result<String, String> {
    // Check if file exists
    let path = std::path::Path::new(&test_file);
    if !path.exists() {
        return Err(format!("File does not exist: {}", test_file));
    }
    
    // Set the file in state
    if let Some(state) = app.try_state::<AppState>() {
        let mut startup_file = state.startup_file.lock().unwrap();
        *startup_file = Some(test_file.clone());
        
        // Emit the file association event
        let _ = app.emit("file-association", &test_file);
        
        Ok(format!("Successfully set and emitted file association for: {}", test_file))
    } else {
        Err("Could not access app state".to_string())
    }
}

#[tauri::command]
fn test_file_association(test_file: String) -> Result<String, String> {
    let path = std::path::Path::new(&test_file);
    if path.exists() {
        match std::fs::read_to_string(&test_file) {
            Ok(content) => {
                Ok(format!("File read successfully! Length: {} characters", content.len()))
            }
            Err(e) => {
                Err(format!("Failed to read file: {}", e))
            }
        }
    } else {
        Err(format!("File does not exist: {}", test_file))
    }
}

#[tauri::command]
fn check_file_association_status() -> Result<String, String> {
    // Check if our app bundle exists
    let app_path = "/Applications/Markdown Editor.app";
    let app_exists = std::path::Path::new(app_path).exists();
    
    let mut status = Vec::new();
    status.push(format!("App Bundle Status: {}", if app_exists { "✅ Found" } else { "❌ Not Found" }));
    status.push(format!("App Path: {}", app_path));
    
    if app_exists {
        // Try to read the Info.plist to check bundle identifier
        let info_plist_path = format!("{}/Contents/Info.plist", app_path);
        if let Ok(plist_content) = std::fs::read_to_string(&info_plist_path) {
            if plist_content.contains("com.markdownviewer.desktop") {
                status.push("Bundle ID: ✅ com.markdownviewer.desktop found".to_string());
            } else {
                status.push("Bundle ID: ❌ Expected bundle ID not found".to_string());
            }
            
            if plist_content.contains("CFBundleDocumentTypes") {
                status.push("Document Types: ✅ File associations configured".to_string());
            } else {
                status.push("Document Types: ❌ No file associations found".to_string());
            }
        } else {
            status.push("Info.plist: ❌ Could not read".to_string());
        }
    }
    
    // Check command line args for debugging
    let args: Vec<String> = std::env::args().collect();
    status.push(format!("Current Args: {:?}", args));
    
    Ok(status.join("\n"))
}

#[tauri::command]
fn register_file_associations() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        
        let app_path = "/Applications/Markdown Editor.app";
        
        // Try to register using lsregister
        match Command::new("/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister")
            .args(["-f", app_path])
            .output() {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                
                if output.status.success() {
                    Ok(format!("✅ File associations registered successfully\nOutput: {}", stdout))
                } else {
                    Err(format!("❌ lsregister failed\nStderr: {}", stderr))
                }
            }
            Err(e) => {
                Err(format!("❌ Failed to run lsregister: {}", e))
            }
        }
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Err("File association registration only supported on macOS".to_string())
    }
}

#[tauri::command]
fn test_open_command(test_file: String) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        
        // Test opening the file with our app using the open command
        match Command::new("open")
            .args(["-a", "Markdown Editor", &test_file])
            .output() {
            Ok(output) => {
                let _stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                
                if output.status.success() {
                    Ok(format!("✅ Open command executed successfully\nThis should trigger file association events if working properly."))
                } else {
                    Err(format!("❌ Open command failed\nStderr: {}", stderr))
                }
            }
            Err(e) => {
                Err(format!("❌ Failed to run open command: {}", e))
            }
        }
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Err("Open command test only supported on macOS".to_string())
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

#[cfg(target_os = "macos")]
fn setup_macos_file_handlers(app_handle: AppHandle) {
    // Listen for all possible macOS file association events
    let events = vec![
        "tauri://file-drop",
        "tauri://file-open", 
        "tauri://open-url",
        "tauri://open-file",
        "tauri://deep-link",
        "open-file",
        "file-open",
        "open-url",
        "deep-link",
        "application-open-file",
        "application-open-url",
        "NSApplicationOpenFile",
        "NSApplicationOpenFiles"
    ];
    
    for event_name in events {
        let app_clone = app_handle.clone();
        let _ = app_handle.listen(event_name, move |event| {
            handle_file_association_event(&app_clone, event.payload());
        });
    }
}

#[cfg(target_os = "macos")]
fn handle_file_association_event(app_handle: &AppHandle, payload: &str) {
    println!("[Rust] Processing file association payload: {}", payload);
    
    // Try different parsing strategies
    if let Ok(file_path) = serde_json::from_str::<String>(payload) {
        if is_valid_file_path(&file_path) {
            set_and_emit_file(app_handle, &file_path);
            return;
        }
    }
    
    if let Ok(file_paths) = serde_json::from_str::<Vec<String>>(payload) {
        if let Some(first_path) = file_paths.first() {
            if is_valid_file_path(first_path) {
                set_and_emit_file(app_handle, first_path);
                return;
            }
        }
    }
    
    if let Ok(payload_obj) = serde_json::from_str::<serde_json::Value>(payload) {
        if let Some(paths) = payload_obj.get("paths").and_then(|p| p.as_array()) {
            if let Some(first_path) = paths.first().and_then(|p| p.as_str()) {
                if is_valid_file_path(first_path) {
                    set_and_emit_file(app_handle, first_path);
                    return;
                }
            }
        }
        
        if let Some(url) = payload_obj.get("url").and_then(|u| u.as_str()) {
            if url.starts_with("file://") {
                let file_path = url.replace("file://", "");
                let decoded_path = urlencoding::decode(&file_path).unwrap_or_else(|_| file_path.clone().into());
                if is_valid_file_path(&decoded_path) {
                    set_and_emit_file(app_handle, &decoded_path);
                    return;
                }
            }
        }
    }
}

#[cfg(target_os = "macos")]
fn is_valid_file_path(path: &str) -> bool {
    if path.is_empty() || path.starts_with("-") || path.contains("markdown-editor") {
        return false;
    }
    
    let file_path = std::path::Path::new(path);
    file_path.exists() && file_path.is_file()
}

#[cfg(target_os = "macos")]
fn set_and_emit_file(app_handle: &AppHandle, file_path: &str) {
    println!("[Rust] Setting and emitting file: {}", file_path);
    
    if let Some(state) = app_handle.try_state::<AppState>() {
        let mut startup_file = state.startup_file.lock().unwrap();
        *startup_file = Some(file_path.to_string());
        
        let _ = app_handle.emit("file-association", file_path);
        println!("[Rust] File association event emitted: {}", file_path);
    }
}



#[cfg(target_os = "macos")]
fn set_and_emit_file_from_run_event(app_handle: &tauri::AppHandle, file_path: &str) {
    println!("[Rust] RunEvent - Setting and emitting file: {}", file_path);
    
    if let Some(state) = app_handle.try_state::<AppState>() {
        let mut startup_file = state.startup_file.lock().unwrap();
        *startup_file = Some(file_path.to_string());
        
        let _ = app_handle.emit("file-association", file_path);
        println!("[Rust] RunEvent - File association event emitted: {}", file_path);
    }
}

#[cfg(target_os = "macos")]
fn check_and_emit_pending_file_from_run_event(app_handle: &tauri::AppHandle) {
    if let Some(state) = app_handle.try_state::<AppState>() {
        let startup_file = state.startup_file.lock().unwrap();
        if let Some(ref file_path) = *startup_file {
            println!("[Rust] RunEvent - Emitting pending file: {}", file_path);
            let _ = app_handle.emit("file-association", file_path);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Get command line arguments
    let args: Vec<String> = env::args().collect();
    
    let startup_file = if args.len() > 1 {
        // Take the last argument as the file (most reliable for file associations)
        let file_arg = &args[args.len() - 1];
        
        // Skip if it's a flag or the executable path
        if file_arg.starts_with("-") || file_arg.contains("markdown-editor") {
            None
        } else {
            let path = std::path::Path::new(file_arg);
            if path.exists() {
                Some(file_arg.clone())
            } else {
                None
            }
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

        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            println!("[Rust] Single instance event - args: {:?}", args);
            println!("[Rust] Single instance event - cwd: {:?}", _cwd);
            
            // Handle file association from Finder (second instance)
            if args.len() > 1 {
                let file_arg = &args[args.len() - 1];
                println!("[Rust] Single instance - checking file arg: '{}'", file_arg);
                if !file_arg.starts_with("-") && !file_arg.contains("markdown-editor") {
                    let path = std::path::Path::new(file_arg);
                    println!("[Rust] Single instance - path exists: {}", path.exists());
                    if path.exists() {
                        println!("[Rust] Setting file from single instance: {}", file_arg);
                        
                        if let Some(state) = app.try_state::<AppState>() {
                            let mut startup_file = state.startup_file.lock().unwrap();
                            *startup_file = Some(file_arg.clone());
                            
                            // Emit event to frontend
                            let _ = app.emit("file-association", file_arg);
                            println!("[Rust] File association event emitted from single instance");
                        }
                        
                        // Also try to bring window to front
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.set_focus();
                            let _ = window.unminimize();
                        }
                    }
                } else {
                    println!("[Rust] Single instance - skipping file arg (flag or executable): '{}'", file_arg);
                }
            } else {
                println!("[Rust] Single instance - no args provided");
            }
        }))
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            get_startup_file,
            clear_startup_file,
            open_file_direct,
            debug_command_line,
            debug_file_open_status,
            force_check_startup_file,
            test_file_association,
            test_manual_file_association,
            check_file_association_status,
            register_file_associations,
            test_open_command,
            convert_local_image_path,
            get_absolute_paths_from_names,
            get_dropped_file_absolute_path
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                // Handle macOS file open events (AppleEvents)
                let app_handle = app.handle().clone();
                
                // Listen for file drop events
                app.listen("tauri://file-drop", move |event| {
                    println!("[Rust] File drop event: {:?}", event.payload());
                    if let Ok(payload) = serde_json::from_str::<serde_json::Value>(event.payload()) {
                        if let Some(paths) = payload.get("paths").and_then(|p| p.as_array()) {
                            if let Some(first_path) = paths.first().and_then(|p| p.as_str()) {
                                println!("[Rust] Setting file from drop event: {}", first_path);
                                if let Some(state) = app_handle.try_state::<AppState>() {
                                    let mut startup_file = state.startup_file.lock().unwrap();
                                    *startup_file = Some(first_path.to_string());
                                    let _ = app_handle.emit("file-association", first_path);
                                }
                            }
                        }
                    }
                });
                
                // Listen for various macOS file open events
                let app_handle2 = app.handle().clone();
                let events_to_listen = vec![
                    "tauri://file-open",
                    "tauri://open-url", 
                    "tauri://open-file",
                    "open-file",
                    "file-open",
                    "tauri://menu",
                    "tauri://file-drop-hover",
                    "tauri://file-drop-cancelled",
                    "tauri://deep-link",
                    "deep-link",
                    "application-open-file",
                    "application-open-url"
                ];
                
                for event_name in events_to_listen {
                    let app_handle_clone = app_handle2.clone();
                    let event_name_clone = event_name.to_string();
                    app.listen(event_name, move |event| {
                        println!("[Rust] {} event: {:?}", event_name_clone, event.payload());
                        
                        // Try to parse as string first
                        if let Ok(file_path) = serde_json::from_str::<String>(event.payload()) {
                            println!("[Rust] Setting file from {} event (string): {}", event_name_clone, file_path);
                            if let Some(state) = app_handle_clone.try_state::<AppState>() {
                                let mut startup_file = state.startup_file.lock().unwrap();
                                *startup_file = Some(file_path.clone());
                                let _ = app_handle_clone.emit("file-association", &file_path);
                            }
                        }
                        // Try to parse as array of strings
                        else if let Ok(file_paths) = serde_json::from_str::<Vec<String>>(event.payload()) {
                            if let Some(first_path) = file_paths.first() {
                                println!("[Rust] Setting file from {} event (array): {}", event_name_clone, first_path);
                                if let Some(state) = app_handle_clone.try_state::<AppState>() {
                                    let mut startup_file = state.startup_file.lock().unwrap();
                                    *startup_file = Some(first_path.clone());
                                    let _ = app_handle_clone.emit("file-association", first_path);
                                }
                            }
                        }
                        // Try to parse as object with paths
                        else if let Ok(payload) = serde_json::from_str::<serde_json::Value>(event.payload()) {
                            if let Some(paths) = payload.get("paths").and_then(|p| p.as_array()) {
                                if let Some(first_path) = paths.first().and_then(|p| p.as_str()) {
                                    println!("[Rust] Setting file from {} event (object): {}", event_name_clone, first_path);
                                    if let Some(state) = app_handle_clone.try_state::<AppState>() {
                                        let mut startup_file = state.startup_file.lock().unwrap();
                                        *startup_file = Some(first_path.to_string());
                                        let _ = app_handle_clone.emit("file-association", first_path);
                                    }
                                }
                            }
                        }
                    });
                }
                
                // Also check if we have a startup file from command line and emit it after a delay
                let app_handle3 = app.handle().clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(100));
                    if let Some(state) = app_handle3.try_state::<AppState>() {
                        let startup_file = state.startup_file.lock().unwrap();
                        if let Some(ref file_path) = *startup_file {
                            println!("[Rust] Emitting startup file from setup (delayed): {}", file_path);
                            let _ = app_handle3.emit("file-association", file_path);
                        }
                    }
                });
                
                let app_menu = SubmenuBuilder::new(app, "Markdown Editor")
                    .item(&MenuItemBuilder::new("About Markdown Editor").id("about").build(app)?)
                    .separator()
                    .item(&MenuItemBuilder::new("Settings...").id("settings").accelerator("CmdOrCtrl+,").build(app)?)
                    .separator()
                    .item(&MenuItemBuilder::new("Hide Markdown Editor").id("hide").accelerator("CmdOrCtrl+H").build(app)?)
                    .item(&MenuItemBuilder::new("Quit Markdown Editor").id("quit").accelerator("CmdOrCtrl+Q").build(app)?)
                    .build()?;

                let file_menu = SubmenuBuilder::new(app, "File")
                    .item(&MenuItemBuilder::new("New").id("new").accelerator("CmdOrCtrl+N").build(app)?)
                    .item(&MenuItemBuilder::new("Open...").id("open").accelerator("CmdOrCtrl+O").build(app)?)
                    .separator()
                    .item(&MenuItemBuilder::new("Save").id("save").accelerator("CmdOrCtrl+S").build(app)?)
                    .item(&MenuItemBuilder::new("Save As...").id("save-as").accelerator("CmdOrCtrl+Shift+S").build(app)?)
                    .separator()
                    .item(&MenuItemBuilder::new("Close").id("close").accelerator("CmdOrCtrl+W").build(app)?)
                    .build()?;

                let edit_menu = SubmenuBuilder::new(app, "Edit")
                    .item(&MenuItemBuilder::new("Undo").id("undo").accelerator("CmdOrCtrl+Z").build(app)?)
                    .item(&MenuItemBuilder::new("Redo").id("redo").accelerator("CmdOrCtrl+Shift+Z").build(app)?)
                    .separator()
                    .item(&MenuItemBuilder::new("Cut").id("cut").accelerator("CmdOrCtrl+X").build(app)?)
                    .item(&MenuItemBuilder::new("Copy").id("copy").accelerator("CmdOrCtrl+C").build(app)?)
                    .item(&MenuItemBuilder::new("Paste").id("paste").accelerator("CmdOrCtrl+V").build(app)?)
                    .separator()
                    .item(&MenuItemBuilder::new("Select All").id("select-all").accelerator("CmdOrCtrl+A").build(app)?)
                    .build()?;

                let view_menu = SubmenuBuilder::new(app, "View")
                    .item(&MenuItemBuilder::new("Toggle Theme").id("toggle-theme").accelerator("CmdOrCtrl+T").build(app)?)
                    .separator()
                    .item(&MenuItemBuilder::new("Code Mode").id("mode-code").accelerator("CmdOrCtrl+1").build(app)?)
                    .item(&MenuItemBuilder::new("Preview Mode").id("mode-preview").accelerator("CmdOrCtrl+2").build(app)?)
                    .item(&MenuItemBuilder::new("Split Mode").id("mode-split").accelerator("CmdOrCtrl+3").build(app)?)
                    .build()?;

                let help_menu = SubmenuBuilder::new(app, "Help")
                    .item(&MenuItemBuilder::new("Help").id("help").accelerator("F1").build(app)?)
                    .build()?;

                let menu = MenuBuilder::new(app)
                    .item(&app_menu)
                    .item(&file_menu)
                    .item(&edit_menu)
                    .item(&view_menu)
                    .item(&help_menu)
                    .build()?;

                app.set_menu(menu)?;
            }
            
            // Add macOS-specific open-url event handler for file associations
            #[cfg(target_os = "macos")]
            {
                let app_handle = app.handle().clone();
                app.listen("open-url", move |event| {
                    println!("[Rust] open-url event: {:?}", event.payload());
                    if let Ok(url) = serde_json::from_str::<String>(event.payload()) {
                        // Handle file:// URLs from macOS file associations
                        if url.starts_with("file://") {
                            let file_path = url.replace("file://", "");
                            let decoded_path = urlencoding::decode(&file_path).unwrap_or_else(|_| file_path.clone().into());
                            println!("[Rust] Setting file from open-url: {}", decoded_path);
                            if let Some(state) = app_handle.try_state::<AppState>() {
                                let mut startup_file = state.startup_file.lock().unwrap();
                                *startup_file = Some(decoded_path.to_string());
                                let _ = app_handle.emit("file-association", decoded_path.as_ref());
                            }
                        }
                    }
                });
            }
            
            // Add window event handlers for macOS application lifecycle
            #[cfg(target_os = "macos")]
            {
                let app_handle = app.handle().clone();
                if let Some(window) = app.get_webview_window("main") {
                    let _window_clone = window.clone();
                    let _ = window.on_window_event(move |event| {
                        match event {
                            tauri::WindowEvent::Focused(focused) => {
                                if *focused {
                                    println!("[Rust] Window focused - checking for pending file associations");
                                    // Check if there's a pending file to open when window gets focus
                                    if let Some(state) = app_handle.try_state::<AppState>() {
                                        let startup_file = state.startup_file.lock().unwrap();
                                        if let Some(ref file_path) = *startup_file {
                                            println!("[Rust] Emitting pending file on focus: {}", file_path);
                                            let _ = app_handle.emit("file-association", file_path);
                                        }
                                    }
                                }
                            }
                            _ => {}
                        }
                    });
                }
            }
            
            // Set up legacy event listeners as fallback
            #[cfg(target_os = "macos")]
            {
                setup_macos_file_handlers(app.handle().clone());
            }
            
            // Final check: emit any startup file after all setup is complete
            #[cfg(target_os = "macos")]
            {
                let app_handle_final = app.handle().clone();
                std::thread::spawn(move || {
                    // Wait longer to ensure all macOS events have been processed
                    std::thread::sleep(std::time::Duration::from_millis(500));
                    if let Some(state) = app_handle_final.try_state::<AppState>() {
                        let startup_file = state.startup_file.lock().unwrap();
                        if let Some(ref file_path) = *startup_file {
                            println!("[Rust] Final startup file emission: {}", file_path);
                            let _ = app_handle_final.emit("file-association", file_path);
                        }
                    }
                });
            }
            
            Ok(())
        })
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "new" => { let _ = app.emit("menu-new", ()); }
                "open" => { let _ = app.emit("menu-open", ()); }
                "save" => { let _ = app.emit("menu-save", ()); }
                "save-as" => { let _ = app.emit("menu-save-as", ()); }
                "close" => { let _ = app.emit("menu-close", ()); }
                "settings" => { let _ = app.emit("menu-settings", ()); }
                "toggle-theme" => { let _ = app.emit("menu-toggle-theme", ()); }
                "mode-code" => { let _ = app.emit("menu-mode-code", ()); }
                "mode-preview" => { let _ = app.emit("menu-mode-preview", ()); }
                "mode-split" => { let _ = app.emit("menu-mode-split", ()); }
                // Edit menu items - let the webview handle these natively
                "undo" => { let _ = app.emit("menu-undo", ()); }
                "redo" => { let _ = app.emit("menu-redo", ()); }
                "cut" => { let _ = app.emit("menu-cut", ()); }
                "copy" => { let _ = app.emit("menu-copy", ()); }
                "paste" => { let _ = app.emit("menu-paste", ()); }
                "select-all" => { let _ = app.emit("menu-select-all", ()); }
                "help" => { let _ = app.emit("menu-help", ()); }
                "about" => { let _ = app.emit("menu-about", ()); }
                "hide" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
                "quit" => { app.exit(0); }
                _ => {}
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            #[cfg(target_os = "macos")]
            {
                match event {
                    RunEvent::Opened { urls } => {
                        println!("[Rust] RunEvent::Opened with URLs: {:?}", urls);
                        for url in urls {
                            if url.scheme() == "file" {
                                if let Ok(file_path) = url.to_file_path() {
                                    let path_str = file_path.to_string_lossy().to_string();
                                    println!("[Rust] File opened via RunEvent: {}", path_str);
                                    set_and_emit_file_from_run_event(app_handle, &path_str);
                                }
                            }
                        }
                    }
                    RunEvent::WindowEvent { label: _, event: WindowEvent::Focused(focused), .. } => {
                        if focused {
                            println!("[Rust] Window focused - checking for pending files");
                            check_and_emit_pending_file_from_run_event(app_handle);
                        }
                    }
                    _ => {}
                }
            }
        });

}