extends Node
## سجل أسطول مركبات مَسَالِك الخمس (Phase 2) مع إعدادات الفيزياء المستقلة

const FLEET_SPECS := {
	"shahiq": {
		"name_ar": "الشاهق",
		"category": "4x4 Mountain SUV",
		"base_mass_kg": 1920.0,
		"max_cargo_kg": 250.0,
		"max_torque_nm": 450.0,
		"drivetrain": "4H",
		"gears": 6,
		"fuel_tank_l": 85.0
	},
	"saqr": {
		"name_ar": "الصقر",
		"category": "Highland Pickup",
		"base_mass_kg": 1780.0,
		"max_cargo_kg": 750.0,
		"max_torque_nm": 420.0,
		"drivetrain": "4H",
		"gears": 5,
		"fuel_tank_l": 80.0
	},
	"rahhal": {
		"name_ar": "الرحّال",
		"category": "Desert Raid Cruiser",
		"base_mass_kg": 1640.0,
		"max_cargo_kg": 180.0,
		"max_torque_nm": 490.0,
		"drivetrain": "AWD",
		"gears": 6,
		"fuel_tank_l": 90.0
	},
	"madina": {
		"name_ar": "المدينة",
		"category": "Touring Sedan",
		"base_mass_kg": 1380.0,
		"max_cargo_kg": 120.0,
		"max_torque_nm": 340.0,
		"drivetrain": "FWD",
		"gears": 6,
		"fuel_tank_l": 60.0
	},
	"jabal": {
		"name_ar": "الجبل",
		"category": "Medium Cargo Truck",
		"base_mass_kg": 4400.0,
		"max_cargo_kg": 2400.0,
		"max_torque_nm": 1120.0,
		"drivetrain": "4H",
		"gears": 8,
		"fuel_tank_l": 160.0
	}
}
