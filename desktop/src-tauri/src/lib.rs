// Page Assist Desktop - Tauri Backend
// System tray, floating window, and global shortcuts implementation

use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem, Window, WindowBuilder, WindowUrl,
};

/// Create floating window (borderless, always on top)
#[tauri::command]
async fn create_floating_window(app: AppHandle) -> Result<(), String> {
    // Check if floating window already exists
    if app.get_window("floating").is_some() {
        return Err("Floating window already exists".to_string());
    }

    WindowBuilder::new(
        &app,
        "floating",
        WindowUrl::App("/".into()),
    )
    .title("Page Assist - Floating")
    .inner_size(400.0, 600.0)
    .min_inner_size(300.0, 400.0)
    .decorations(false) // Borderless window
    .always_on_top(true) // Float above other windows
    .skip_taskbar(true) // Don't show in taskbar
    .resizable(true)
    .visible(false) // Start hidden, will be shown later
    .build()
    .map_err(|e| format!("Failed to create floating window: {}", e))?;

    Ok(())
}

/// Toggle floating window visibility
#[tauri::command]
async fn toggle_floating_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_window("floating") {
        if window.is_visible().unwrap_or(false) {
            window.hide().map_err(|e| e.to_string())?;
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    } else {
        // Create floating window if it doesn't exist
        create_floating_window(app).await?;

        // Show it after creation
        if let Some(window) = app.get_window("floating") {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

/// Toggle main window visibility
#[tauri::command]
async fn toggle_main_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_window("main") {
        if window.is_visible().unwrap_or(false) {
            window.hide().map_err(|e| e.to_string())?;
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

/// Set window always on top
#[tauri::command]
async fn set_always_on_top(window: Window, always_on_top: bool) -> Result<(), String> {
    window
        .set_always_on_top(always_on_top)
        .map_err(|e| e.to_string())
}

/// Create system tray
fn create_system_tray() -> SystemTray {
    let show_main = CustomMenuItem::new("show_main".to_string(), "Show Main Window");
    let floating_mode = CustomMenuItem::new("floating".to_string(), "Floating Mode");
    let separator = SystemTrayMenuItem::Separator;
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show_main)
        .add_item(floating_mode)
        .add_native_item(separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

/// Handle system tray events
fn handle_system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            // Toggle main window on left click
            let app_handle = app.clone();
            tauri::async_runtime::spawn(async move {
                let _ = toggle_main_window(app_handle).await;
            });
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "show_main" => {
                let app_handle = app.clone();
                tauri::async_runtime::spawn(async move {
                    let _ = toggle_main_window(app_handle).await;
                });
            }
            "floating" => {
                let app_handle = app.clone();
                tauri::async_runtime::spawn(async move {
                    let _ = toggle_floating_window(app_handle).await;
                });
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

/// Main application entry point
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .system_tray(create_system_tray())
        .on_system_tray_event(handle_system_tray_event)
        .invoke_handler(tauri::generate_handler![
            create_floating_window,
            toggle_floating_window,
            toggle_main_window,
            set_always_on_top,
        ])
        .setup(|app| {
            // Register global shortcuts (optional - requires additional setup)
            // For now, shortcuts are handled via menu accelerators

            // Hide main window on start (will be shown via tray icon)
            // Uncomment if you want app to start minimized to tray:
            // if let Some(window) = app.get_window("main") {
            //     window.hide().unwrap();
            // }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
