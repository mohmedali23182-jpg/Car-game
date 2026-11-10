class_name PhotoAlbum
extends RefCounted
static func clear(v: VBoxContainer) -> void:
	for child in v.get_children(): v.remove_child(child);child.queue_free()
static func populate(v: VBoxContainer,back: Callable) -> void:
	clear(v);MasalikUI.label(v,"ألبوم الرحلة",30)
	var files: Array[String]=[]
	for name in DirAccess.get_files_at("user://"):
		if name.begins_with("MASALIK-") and name.ends_with(".png"): files.append(name)
	files.sort();files.reverse()
	if files.is_empty(): MasalikUI.label(v,"صورك تظهر هنا بعد التقاطها من وضع التصوير.",22)
	for name in files:
		var stamp := name.trim_prefix("MASALIK-").trim_suffix(".png")
		var caption := "صورة من الرحلة"
		if stamp.is_valid_int(): caption=Time.get_datetime_string_from_unix_time(int(stamp)+int(Time.get_time_zone_from_system().bias)*60).replace("T"," · ")
		MasalikUI.button(v,caption,func(): view(v,"user://"+name,back))
	MasalikUI.button(v,"رجوع",back)
static func view(v: VBoxContainer,path: String,back: Callable) -> void:
	var img := Image.load_from_file(path)
	if img==null: return
	clear(v);MasalikUI.label(v,"من رحلاتك في المسالك",28)
	var preview := TextureRect.new();preview.texture=ImageTexture.create_from_image(img);preview.custom_minimum_size=Vector2(800,420);preview.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;preview.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED;v.add_child(preview)
	MasalikUI.button(v,"تصدير صورة إلى ملف محلي",func(): export_photo(v,path))
	MasalikUI.button(v,"رجوع للألبوم",func(): populate(v,back))
static func export_photo(v: VBoxContainer,path: String) -> void:
	var dialog := FileDialog.new();dialog.use_native_dialog=true;dialog.file_mode=FileDialog.FILE_MODE_SAVE_FILE;dialog.access=FileDialog.ACCESS_FILESYSTEM;dialog.current_file=path.get_file();dialog.filters=PackedStringArray(["*.png ; صورة من المسالك"]);v.add_child(dialog)
	dialog.file_selected.connect(func(destination: String):
		var source := FileAccess.get_file_as_bytes(path);var target := FileAccess.open(destination,FileAccess.WRITE)
		if target!=null: target.store_buffer(source);target.close();MasalikUI.label(v,"تم تصدير الصورة.")
		else: MasalikUI.label(v,"تعذر حفظ الصورة في الموقع المختار.")
		dialog.queue_free())
	dialog.popup_centered_ratio(0.8)
