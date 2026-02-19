// src/main.rs (zkVM entry)
#[no_mangle]
pub extern "C" fn main() {
    let mut y = 300.0;  // starting position
    let mut velocity = 0.0;
    let gravity = 0.5;
    let flap_force = -10.0;

    // Simulate 50 flaps (contoh input public: flap_times)
    for _ in 0..50 {
        velocity += flap_force;
        y += velocity;
        velocity += gravity;
        if y < 0.0 || y > 600.0 {  // collision ground/ceiling
            println!("INVALID_SCORE");
            return;
        }
    }
    println!("VALID_SCORE:{}", 50);  // score = flaps survived
}
