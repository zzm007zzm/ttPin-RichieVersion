use tauri::Manager;
use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[derive(serde::Deserialize, serde::Serialize)]
struct TranslatorTarget {
  language: String,
  #[serde(rename = "deploymentName")]
  #[serde(skip_serializing_if = "Option::is_none")]
  deployment_name: Option<String>,
}

#[derive(serde::Deserialize, serde::Serialize)]
struct TranslatorInput {
  text: String,
  #[serde(skip_serializing_if = "Option::is_none")]
  language: Option<String>,
  targets: Vec<TranslatorTarget>,
}

#[derive(serde::Deserialize)]
struct TranslateArgs {
  translate_endpoint: String,
  key: String,
  region: String,
  deployment_name: String,
  text: String,
  from: Option<String>,
  to: String,
}

#[derive(serde::Serialize)]
struct TranslateResult {
  translated_text: String,
  detected_language: Option<String>,
}

#[derive(serde::Deserialize)]
struct LanguagesArgs {
  languages_endpoint: Option<String>,
}

fn with_api_version(mut base: reqwest::Url, api_version: &str) -> reqwest::Url {
  let mut pairs: Vec<(String, String)> = base
    .query_pairs()
    .map(|(k, v)| (k.to_string(), v.to_string()))
    .collect();

  if !pairs.iter().any(|(k, _)| k == "api-version") {
    pairs.push(("api-version".to_string(), api_version.to_string()));
  }

  base.set_query(None);
  base.query_pairs_mut().extend_pairs(pairs);
  base
}

#[tauri::command]
async fn translator_languages(args: LanguagesArgs) -> Result<serde_json::Value, String> {
  let endpoint = args
    .languages_endpoint
    .unwrap_or_else(|| "https://api.cognitive.microsofttranslator.com/languages".to_string());

  let base = reqwest::Url::parse(&endpoint).map_err(|e| format!("Invalid languages endpoint: {e}"))?;
  let url = {
    let mut url = with_api_version(base, "2025-10-01-preview");
    // ensure scope=translation
    let mut pairs: Vec<(String, String)> = url
      .query_pairs()
      .map(|(k, v)| (k.to_string(), v.to_string()))
      .collect();
    if !pairs.iter().any(|(k, _)| k == "scope") {
      pairs.push(("scope".to_string(), "translation".to_string()));
    }
    url.set_query(None);
    url.query_pairs_mut().extend_pairs(pairs);
    url
  };

  let client = reqwest::Client::new();
  let resp = client.get(url).send().await.map_err(|e| format!("Request failed: {e}"))?;
  let status = resp.status();
  let text = resp.text().await.map_err(|e| format!("Read response failed: {e}"))?;

  if !status.is_success() {
    return Err(format!("Languages request failed: {status}. {text}"));
  }

  serde_json::from_str(&text).map_err(|e| format!("Invalid JSON: {e}"))
}

#[tauri::command]
async fn translator_translate(args: TranslateArgs) -> Result<TranslateResult, String> {
  let base = reqwest::Url::parse(&args.translate_endpoint)
    .map_err(|e| format!("Invalid translate endpoint: {e}"))?;
  let url = with_api_version(base, "2025-10-01-preview");

  let mut input = TranslatorInput {
    text: args.text.clone(),
    language: None,
    targets: vec![TranslatorTarget {
      language: args.to.clone(),
      deployment_name: Some(args.deployment_name.clone()),
    }],
  };

  if let Some(from) = args.from.clone() {
    let from = from.trim().to_string();
    if !from.is_empty() && from.to_lowercase() != "auto" {
      input.language = Some(from);
    }
  }

  let client = reqwest::Client::new();

  async fn do_request(
    client: &reqwest::Client,
    url: reqwest::Url,
    key: &str,
    region: &str,
    input: &TranslatorInput,
  ) -> Result<(reqwest::StatusCode, String), String> {
    let payload = serde_json::json!({ "inputs": [input] });
    let resp = client
      .post(url)
      .header("content-type", "application/json")
      .header("ocp-apim-subscription-key", key)
      .header("ocp-apim-subscription-region", region)
      .json(&payload)
      .send()
      .await
      .map_err(|e| format!("Request failed: {e}"))?;

    let status = resp.status();
    let text = resp.text().await.map_err(|e| format!("Read response failed: {e}"))?;
    Ok((status, text))
  }

  let (mut status, mut text) = do_request(&client, url.clone(), &args.key, &args.region, &input).await?;

  // Some language pairs may reject an explicit source language; retry once without it.
  if status == reqwest::StatusCode::BAD_REQUEST && input.language.is_some() {
    let mut input2 = input;
    input2.language = None;
    let retry = do_request(&client, url.clone(), &args.key, &args.region, &input2).await;
    if let Ok((st, tx)) = retry {
      status = st;
      text = tx;
    }
  }

  if !status.is_success() {
    return Err(format!("Translate request failed: {status}. {text}"));
  }

  let data: serde_json::Value = serde_json::from_str(&text).map_err(|e| format!("Invalid JSON: {e}"))?;
  let translated_text = data
    .get("value")
    .and_then(|v| v.get(0))
    .and_then(|v| v.get("translations"))
    .and_then(|v| v.get(0))
    .and_then(|v| v.get("text"))
    .and_then(|v| v.as_str())
    .ok_or_else(|| "Translate response missing value[0].translations[0].text".to_string())?
    .to_string();

  let detected_language = data
    .get("value")
    .and_then(|v| v.get(0))
    .and_then(|v| v.get("detectedLanguage"))
    .and_then(|v| v.get("language"))
    .and_then(|v| v.as_str())
    .map(|s| s.to_string());

  Ok(TranslateResult {
    translated_text,
    detected_language,
  })
}

#[tauri::command]
fn set_always_on_top(window: tauri::WebviewWindow, enabled: bool) -> Result<(), String> {
  window
    .set_always_on_top(enabled)
    .map_err(|e| format!("Failed to set always-on-top: {e}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_sql::Builder::new().build())
    .invoke_handler(tauri::generate_handler![translator_languages, translator_translate, set_always_on_top])
    .setup(|app| {
      // Use the generated Tauri icon for both the window and tray.
      // This makes the icon update immediately in dev, instead of relying on cached defaults.
      fn load_png_icon(bytes: &[u8]) -> Option<tauri::image::Image<'static>> {
        let decoded = image::load_from_memory_with_format(bytes, image::ImageFormat::Png).ok()?;
        let rgba = decoded.to_rgba8();
        let (width, height) = rgba.dimensions();
        Some(tauri::image::Image::new_owned(rgba.into_raw(), width, height))
      }

      // Pick size-appropriate assets to reduce jaggies from heavy OS scaling.
      // - Window: use a larger icon (256x256) for titlebar/taskbar.
      // - Tray: use 32x32 (Windows will downscale to 16x16, but from a closer size).
      #[cfg(not(target_os = "windows"))]
      let window_icon = load_png_icon(include_bytes!("../icons/128x128@2x.png"));
      let tray_icon = load_png_icon(include_bytes!("../icons/32x32.png"));

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // 获取主窗口并定位到右下角
      if let Some(window) = app.get_webview_window("main") {
        // NOTE (Windows): avoid overriding the native multi-size ICO (ICON_SMALL/ICON_BIG)
        // with a single bitmap. Windows will resample it for the titlebar and it can look
        // noticeably blurry compared to other apps.
        #[cfg(not(target_os = "windows"))]
        {
          if let Some(icon) = window_icon.clone() {
            // Best-effort: if it fails on a platform, keep running.
            let _ = window.set_icon(icon);
          }
        }
        position_window_bottom_right(&window);

        // 阻止窗口关闭，改为隐藏
        let window_for_close = window.clone();
        window.on_window_event(move |event| {
          if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            let _ = window_for_close.hide();
          }
        });

        // 注册全局快捷键：优先 Ctrl+Shift+T；如果被系统占用则降级为其它组合。
        // 关键点：热键占用不能导致 setup 失败，否则应用会直接崩溃。
        // 说明：tauri_plugin_global_shortcut 的 `on_shortcut` 本身会完成注册+回调绑定。
        // 不要再单独调用 `register`，否则会触发“already registered”。
        let shortcuts = ["ctrl+shift+t", "ctrl+alt+t", "ctrl+shift+g"];
        let mut shortcut_registered = false;

        for shortcut in shortcuts {
          let window_for_shortcut = window.clone();
          let handler_result = app.global_shortcut().on_shortcut(
            shortcut,
            move |_app, _shortcut, event| {
              if event.state == ShortcutState::Pressed {
                if let Ok(is_visible) = window_for_shortcut.is_visible() {
                  if is_visible {
                    let _ = window_for_shortcut.hide();
                  } else {
                    let _ = window_for_shortcut.show();
                    let _ = window_for_shortcut.set_focus();
                  }
                }
              }
            },
          );

          if let Err(err) = handler_result {
            log::warn!("Global shortcut handler setup failed ({shortcut}): {err}");
            continue;
          }

          log::info!("Global shortcut registered: {shortcut}");
          shortcut_registered = true;
          break;
        }

        if !shortcut_registered {
          log::warn!("No global shortcut registered (all candidates occupied). App will run without hotkey.");
        }

        // 创建托盘菜单
        let show_i = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
        let settings_i = MenuItem::with_id(app, "settings", "设置", true, None::<&str>)?;
        let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
        let menu = Menu::with_items(app, &[&show_i, &settings_i, &quit_i])?;

        // 构建托盘图标
        let window_for_tray = window.clone();
        let tray = TrayIconBuilder::new()
          .icon(
            tray_icon
              .clone()
              .or_else(|| app.default_window_icon().cloned())
              .expect("default window icon missing"),
          )
          .menu(&menu)
          .show_menu_on_left_click(false)
          .on_menu_event(move |app, event| match event.id.as_ref() {
            "show" => {
              if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
              }
            }
            "settings" => {
              // TODO: 打开设置对话框
              if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
              }
            }
            "quit" => {
              app.exit(0);
            }
            _ => {}
          })
          .on_tray_icon_event(move |_tray, event| {
            if let TrayIconEvent::Click {
              button: MouseButton::Left,
              button_state: MouseButtonState::Up,
              ..
            } = event
            {
              // 左键单击托盘图标显示/隐藏窗口
              if let Ok(is_visible) = window_for_tray.is_visible() {
                if is_visible {
                  let _ = window_for_tray.hide();
                } else {
                  let _ = window_for_tray.show();
                  let _ = window_for_tray.set_focus();
                }
              }
            }
          })
          .build(app)?;

        // 重要：确保托盘句柄在应用生命周期内不被 drop（避免未来某些环境下出现托盘偶发消失/重复创建）。
        std::mem::forget(tray);
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

/// 将窗口定位到屏幕右下角
fn position_window_bottom_right(window: &tauri::WebviewWindow) {
  use tauri::PhysicalPosition;

  // 获取当前显示器
  if let Ok(Some(monitor)) = window.current_monitor() {
    let monitor_pos = monitor.position();
    let monitor_size = monitor.size();

    // 获取窗口外部尺寸（包含边框和标题栏）
    if let Ok(window_size) = window.outer_size() {
      // 计算右下角位置，留出 20 像素边距
      let margin = 20;

      let mut x = monitor_pos.x + monitor_size.width as i32 - window_size.width as i32 - margin;
      let mut y = monitor_pos.y + monitor_size.height as i32 - window_size.height as i32 - margin;

      // clamp：避免负值/出屏（多显示器、缩放、极端分辨率下更稳）
      let min_x = monitor_pos.x;
      let min_y = monitor_pos.y;
      let max_x = monitor_pos.x + monitor_size.width as i32 - window_size.width as i32;
      let max_y = monitor_pos.y + monitor_size.height as i32 - window_size.height as i32;
      x = x.clamp(min_x, max_x);
      y = y.clamp(min_y, max_y);

      let position = PhysicalPosition::new(x, y);
      let _ = window.set_position(position);
    }
  }
}
