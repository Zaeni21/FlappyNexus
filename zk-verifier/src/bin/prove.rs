// src/bin/prove.rs - Host untuk prove & verify
use nexus_zkvm::{prove, verify};  // adjust import sesuai SDK actual (cek repo nexus-zkvm/examples)

fn main() {
    let elf_path = "target/riscv32i-unknown-none-elf/release/flappy-zk-verifier";
    let elf = std::fs::read(elf_path).expect("failed to read ELF");

    println!("Proving guest program...");
    let proof = prove(&elf, &[]).expect("prove failed");  // no input untuk sekarang

    println!("Proof generated!");

    verify(&proof).expect("verification failed");
    println!("Proof verified! Output: {:?}", proof.public_output());
}
