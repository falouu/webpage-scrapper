package main

import (
	"flag"
	"fmt"
	"net/http"
	"log"
	"github.com/gobuffalo/packr/v2"
	"os"
	"os/exec"
)

func main() {
	port := "9876"
	openBrowser := flag.Bool("open-browser", true, "Open default browser after launching the server")
	flag.Parse()

	box := packr.New("My Box", "../content")

	server := &http.Server{
		Addr: ":" + port,
	}
	fs := http.FileServer(box)
	http.Handle("/", fs)

	done := make(chan bool)
	go serve(server, done)

	if *openBrowser {
		cmd := exec.Command("xdg-open", "http://localhost:" + port)
		err := cmd.Run()
		if err != nil {
			fmt.Fprintf(os.Stderr, "ERROR: %v\n", err)
		}
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