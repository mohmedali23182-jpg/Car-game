class_name MasalikUI
extends RefCounted
const GOLD := Color("dcb779")
static func theme() -> Theme:
	var t := Theme.new()
	t.default_font=load("res://assets/fonts/NotoSansArabic-Regular.ttf")
	t.default_font_size=20
	for state in ["normal","hover","pressed","disabled","focus"]:
		var box := StyleBoxFlat.new()
		box.bg_color=Color("24323b") if state=="normal" else Color("4b4c43")
		box.border_color=Color("566164") if state=="normal" else GOLD
		box.set_border_width_all(1)
		box.set_corner_radius_all(12)
		box.content_margin_left=18; box.content_margin_right=18
		box.content_margin_top=8; box.content_margin_bottom=8
		t.set_stylebox(state,"Button",box)
		t.set_color("font_color","Button",Color("fff0d2"))
	t.set_constant("separation","VBoxContainer",12)
	t.set_constant("separation","HBoxContainer",12)
	return t
static func label(parent: Node, text: String, font_size := 20) -> Label:
	var l := Label.new(); l.text=text; l.add_theme_font_size_override("font_size",font_size)
	l.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	l.size_flags_horizontal=Control.SIZE_EXPAND_FILL
	parent.add_child(l); return l
static func button(parent: Node, text: String, callback: Callable) -> Button:
	var b := Button.new(); b.text=text; b.custom_minimum_size.y=52
	parent.add_child(b); b.pressed.connect(callback); return b
static func panel(parent: Node, title: String) -> VBoxContainer:
	var p := PanelContainer.new(); p.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var bg := StyleBoxFlat.new(); bg.bg_color=Color("121c23"); bg.set_content_margin_all(30)
	p.add_theme_stylebox_override("panel",bg); parent.add_child(p)
	var scroll := ScrollContainer.new(); scroll.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);p.add_child(scroll)
	var v := VBoxContainer.new(); v.size_flags_horizontal=Control.SIZE_EXPAND_FILL; scroll.add_child(v)
	label(v,title,34).add_theme_color_override("font_color",GOLD)
	p.modulate.a=0.0
	p.create_tween().set_pause_mode(Tween.TWEEN_PAUSE_PROCESS).tween_property(p,"modulate:a",1.0,0.22)
	return v
static func slider(parent: Node, title: String, value: float, low: float, high: float, changed: Callable) -> HSlider:
	label(parent,title)
	var s := HSlider.new(); s.min_value=low; s.max_value=high; s.step=(high-low)/100.0; s.value=value; s.custom_minimum_size.y=36;parent.add_child(s);s.value_changed.connect(changed);return s
