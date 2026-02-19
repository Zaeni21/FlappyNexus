// zk-verifier/src/main.rs - Guest program untuk Nexus zkVM
// Simulasi Flappy Bird physics: flap → update position → check collision

#![no_std]
#![no_main]
#![feature(alloc_error_handler)]

extern crate alloc;

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

#[no_mangle]
pub extern "C" fn main() {
    let mut y: f64 = 300.0;           // posisi awal bird (tengah layar ~600px)
    let mut velocity: f64 = 0.0;
    let gravity: f64 = 0.5;
    let flap_force: f64 = -10.0;

    let max_steps = 100;  // max simulasi sebelum assume survive (high score)
    let mut survived_steps = 0u32;

    for _ in 0..max_steps {
        velocity += flap_force;   // flap setiap step (asumsi perfect timing)
        y += velocity;
        velocity += gravity;

        if y < 0.0 || y > 600.0 {  // nabrak atas/bawah → game over
            println!("INVALID_SCORE: Collision after {} steps", survived_steps);
            return;
        }

        survived_steps += 1;
    }

    // Survive max_steps → skor valid tinggi
    println!("VALID_SCORE:{}", survived_steps);
}
