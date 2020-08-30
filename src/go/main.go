package main

import (
	"fmt"
	"net/http"
	"log"
	"github.com/gobuffalo/packr/v2"
	"os"
	"os/exec"
)

func main() {
	//fmt.Println("hello GO")
	port := "9876"

	box := packr.New("My Box", "../content")

	server := &http.Server{
		Addr: ":" + port,
	}
	fs := http.FileServer(box)
	http.Handle("/", fs)

	done := make(chan bool)
	go serve(server, done)

	cmd := exec.Command("xdg-open", "http://localhost:" + port)
	err := cmd.Run()
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: %v\n", err)
	}
	<-done
}


func serve(server *http.Server, done chan<- bool) {
	log.Println("Listening on :"+server.Addr+"...")
	err := server.ListenAndServe()
	if err != nil {
	  log.Fatal(err)
	}
	done <- true
}