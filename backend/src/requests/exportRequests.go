package requests

import (
	"../adapter"
	"../generator"
	"../utils"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

type ExportServer struct {
}

func NewExportServer() *ExportServer {
	return &ExportServer{}
}

func (server *ExportServer) ExportHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	bodyString := string(body)

	var exportData adapter.ExportData
	err = json.NewDecoder(bytes.NewReader([]byte(bodyString))).Decode(&exportData)

	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	navGenerator := generator.NewNavigationGenerator(exportData.Collections, exportData.Widgets)

	for k, v := range exportData.Widgets {
		fileName := fmt.Sprintf("output/%v.html", k)
		cardGenerator := generator.NewCardGenerator(v)
		utils.StringToFile(fileName, cardGenerator.GenerateCardHTML(navGenerator))
	}

	http.Error(w, "{\"status\":\"Success\"}", http.StatusOK)
}
