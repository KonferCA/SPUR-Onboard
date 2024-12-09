package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"log"
)

func main() {
	passwords := []string{"admin123", "startup123", "investor123"}
	
	for _, password := range passwords {
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("failed to hash password: %v", err)
		}
		
		fmt.Printf("Password: %s\nHash: %s\n\n", password, string(hash))
	}
} 