//http://plnkr.co/edit/LcGe64WkNOAJZfqc7Ics?p=preview
var CallBack = 0;
var CallBackParam = 0;
var CallonRowSelect = 0;
var UpdateCellChangeUse = 0;

var IsPushMethod = 0;


var sSearch = "";


/* Start stable version */
function GriedFill($scope, $http, $q, $interval, uiGridConstants, URL, header, SavePostDataURL, GridOptionName) {
    var paginationOptions = {
        pageNumber: 1,
        iDisplayStart: 0,
        iDisplayLength: 25,
        sSearch: sSearch,
        iSortCols: null
    };
    $scope[GridOptionName] = {
        paginationPageSizes: [5, 25, 50, 75],
        paginationPageSize: paginationOptions.iDisplayLength,
        useExternalPagination: true,
        useExternalSorting: true,
        //  enableFiltering: true,
        useExternalFiltering: true,
        enableColumnResizing: true,
        //  showColumnFooter: true,
        modifierKeysToMultiSelectCells: true,
        columnDefs:
           header
        ,
        /* START Grid Option  */
        enableGridMenu: true,
        // enableSelectAll: true,
        // exporterMenuPdf: false, // ADD THIS
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
        exporterPdfHeader: { text: "My Header", style: 'headerStyle' },

        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'portrait',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        /* END Grid Option  */
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            //$interval(function () {
            //    $scope.gridApi.core.handleWindowResize();
            //}, 500, 10);

            gridApi.cellNav.on.navigate($scope, function (newRowcol, oldRowCol) {
                $scope.rowCol = newRowcol;
            })
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                $scope.$apply();
                $scope.UpdateChangeRowInfo(rowEntity);

            });

            $scope.gridApi.core.on.filterChanged($scope, function () {
                var grid = this.grid;
                paginationOptions.sSearch = "";
                for (var i = 0; i < grid.columns.length; i++) {
                    if (grid.columns[i].cellClass == "InQueryInt") {
                        var searchTmp = grid.columns[i].filters[0].term.trim().replace(/,\s*$/, "");
                        if (searchTmp != "") {
                            paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " in (" + searchTmp + ")";
                        }
                        else {
                            paginationOptions.sSearch = "";
                        }
                    }
                    else {
                        paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " like '%" + grid.columns[i].filters[0].term + "%'";
                    }
                }
                getPage()
            });
            $scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                if (sortColumns.length == 0) {
                    paginationOptions.iSortCols = null;
                } else {
                    paginationOptions.iSortCols = " Order By " + sortColumns[0].field + " " + sortColumns[0].sort.direction;
                }
                getPage();
            });
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                paginationOptions.pageNumber = newPage;
                paginationOptions.iDisplayLength = pageSize;
                getPage();
            });
            //gridApi.core.on.renderingComplete($scope, function () {
            //    if (CallBack != 0) {
            //        $scope.CallBack();
            //    }
            //});
        }
    };
    var saveRow = function (rowEntity) {
        var promise = $q.defer();
        $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
        $interval(function () {
            var response = $http({
                method: "post",
                async: true,
                url: SavePostDataURL,
                data: rowEntity,
                dataType: "json"
            });
        }, 3000, 1);
    };
    var getPage = function () {
        var url = URL;
        var data = {
            pageNumber: paginationOptions.pageNumber,
            iDisplayLength: paginationOptions.iDisplayLength,
            iDisplayStart: (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength,
            sSearch: paginationOptions.sSearch,
            iSortCols: paginationOptions.iSortCols
        };

        var config = {
            params: data,
            headers: { 'Accept': 'application/json' }
        };
        $http.get(url, config).success(function (data) {
            $scope[GridOptionName].totalItems = data.iTotalDisplayRecords;
            paginationOptions.iDisplayStart = (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength;
            $scope[GridOptionName].data = data.aaData;
        });
    };
    getPage();
}

function DisplaySelectionGried($scope, $http, $q, $interval, uiGridConstants, URL, header, GridOptionName) {
    try { $scope.gridApi.grid.clearAllFilters(); } catch (e) { }

    var paginationOptions = {
        pageNumber: 1,
        iDisplayStart: 0,
        iDisplayLength: 25,
        sSearch: sSearch,//alpesh changes ""
        iSortCols: null
    };
    $scope.RunTimeChecked = false;
    
    //try {
    //    debugger
    //    //for (var i = 0; i < $scope.gridApi.grid.columns.length; i++) {
    //    //    $scope.gridApi.grid.columns[i].filters[0].term = "";
    //    //}
        
    //} catch (e) {

    //}

    $scope[GridOptionName] = {
        paginationPageSizes: [5, 25, 50, 75],
        paginationPageSize: paginationOptions.iDisplayLength,
        useExternalPagination: true,
        useExternalSorting: true,
        enableFiltering: true,
        useExternalFiltering: true,
        enableColumnResizing: true,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        enableGridMenu: true,
        modifierKeysToMultiSelectCells: true,
        //rowTemplate: rowTemplate(),
        columnDefs:
           header
        ,
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
        exporterPdfHeader: { text: "My Header", style: 'headerStyle' },

        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'portrait',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),

        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            //$scope.gridApi.grid.clearAllFilters();
            //var columns = $scope.gridApi.grid.columns;
            //for (var i = 0; i < columns.length; i++) {
            //    if (columns[i].enableFiltering) {
            //        columns[i].filters[0].term = '';
            //    }
            //}

            //$interval(function () {
            //    $scope.gridApi.core.handleWindowResize();
            //}, 500, 10);
            $scope.gridApi.core.on.filterChanged($scope, function () {
                var grid = this.grid;
                paginationOptions.sSearch = "";
                for (var i = 0; i < grid.columns.length; i++) {
                    if (grid.columns[i].filters[0].term != undefined) {
                        if (grid.columns[i].cellClass == "InQueryInt") {
                            var searchTmp = grid.columns[i].filters[0].term.trim().replace(/,\s*$/, "");
                            if (searchTmp != "") {
                                paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " in (" + searchTmp + ")";
                            }
                            else {
                                paginationOptions.sSearch = "";
                            }
                        }
                        else if (grid.columns[i].colDef.type == "boolean") {
                            var searchTmp = grid.columns[i].filters[0].term.trim().replace(/,\s*$/, "");
                            if ((searchTmp).toUpperCase().indexOf("T") != -1) {
                                paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " = " + 1;
                            }
                            else if ((searchTmp).toUpperCase().indexOf("F") != -1) {
                                paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " = " + 0;
                            }
                            else {
                                paginationOptions.sSearch = "";
                            }
                        }
                        else {
                            paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " like '%" + grid.columns[i].filters[0].term + "%'";
                        }
                    }
                }
                
                paginationOptions.pageNumber = 1;
                paginationOptions.iDisplayLength = paginationOptions.iDisplayLength;

                getDisplayRecords()
            });
            $scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                if (sortColumns.length == 0) {
                    paginationOptions.iSortCols = null;
                } else {
                    paginationOptions.iSortCols = " Order By " + sortColumns[0].field + " " + sortColumns[0].sort.direction;
                }
                getDisplayRecords();
            });
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                paginationOptions.pageNumber = newPage;
                paginationOptions.iDisplayLength = pageSize;
                getDisplayRecords();
            });
            //gridApi.core.on.renderingComplete($scope, function () {
            //    $interval(function () {
            //        $scope.gridApi.core.handleWindowResize();
            //    }, 500, 10);
            //});

        }
    };
    var getDisplayRecords = function () {
        var url = URL;//'@Url.Action("GetAllData", "Utility")';
        var data = {
            pageNumber: paginationOptions.pageNumber,
            iDisplayLength: paginationOptions.iDisplayLength,
            iDisplayStart: (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength,
            sSearch: paginationOptions.sSearch,
            iSortCols: paginationOptions.iSortCols
        };
        var config = {
            params: data,
            headers: { 'Accept': 'application/json' }
        };
        $http.get(url, config).success(function (data) {
            $scope[GridOptionName].totalItems = data.iTotalDisplayRecords;
            paginationOptions.iDisplayStart = (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength;
            $scope[GridOptionName].data = data.aaData;

            $scope.heightPopup = (($scope[GridOptionName].data.length * 30) + 30);
            $scope.heightPopup += 100;

        });
    };

    getDisplayRecords();
}

function GriedParam($scope, $http, $q, $interval, uiGridConstants, URL, header, GridOptionName) {
    ApiName = GridOptionName + "API";
    try { $scope[ApiName].grid.clearAllFilters(); } catch (e) { }
    loaderShow();
    var paginationOptions = {
        pageNumber: 1,
        iDisplayStart: 0,
        iDisplayLength: 25,
        sSearch: sSearch,
        iSortCols: null
    };

    $scope[GridOptionName] = {
        HTTPMethod: $scope[GridOptionName] == undefined || $scope[GridOptionName] == "" ? "GET" : $scope[GridOptionName].HTTPMethod,
        paginationPageSizes: [5, 25, 50, 75, 100, 200],
        paginationPageSize: paginationOptions.iDisplayLength,
        useExternalPagination: true,
        useExternalSorting: true,
        //  enableFiltering: true,
        useExternalFiltering: true,
        enableColumnResizing: true,
        //  showColumnFooter: true,
        modifierKeysToMultiSelectCells:true,
        columnDefs:
           header
        ,
        /* START Grid Option  */
        enableGridMenu: true,
        // enableSelectAll: true,
        // exporterMenuPdf: false, // ADD THIS
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
        exporterPdfHeader: { text: "My Header", style: 'headerStyle' },

        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'portrait',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),

        /* END Grid Option  */
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope[ApiName] = gridApi;
            $scope.gridApiParam = gridApi;

            $scope[ApiName].core.on.filterChanged($scope, function () {
                var grid = this.grid;
                paginationOptions.sSearch = "";
                for (var i = 0; i < grid.columns.length; i++) {
                    if (grid.columns[i].filters[0].term != undefined) {
                        var InQueryInt = /\b(InQueryInt)\b/g;
                        var InQueryString = /\b(InQueryString)\b/g;
                        if (grid.columns[i].cellClass != undefined && grid.columns[i].cellClass.match(InQueryInt)) {
                            var searchTmp = grid.columns[i].filters[0].term.trim().replace(/,\s*$/, "");
                            if (searchTmp != "") {
                                paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " in (" + searchTmp + ")";
                            }
                            else {
                                paginationOptions.sSearch = "";
                            }
                        }
                        else if (grid.columns[i].cellClass != undefined && grid.columns[i].cellClass.match(InQueryString)) {
                            var searchTmp = grid.columns[i].filters[0].term.trim().replace(/,\s*$/, "");
                            if (searchTmp != "") {
                                var String = searchTmp.trim().replace(/,/g, "','");
                                paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " in ('" + String + "')";
                            }
                            else {
                                paginationOptions.sSearch = "";
                            }
                        }
                        else {
                            paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " like '%" + grid.columns[i].filters[0].term + "%'";
                        }
                    }
                }
                paginationOptions.sSearch += sSearch;
                getDisplayRecords()
            });
            $scope[ApiName].core.on.sortChanged($scope, function (grid, sortColumns) {
                if (sortColumns.length == 0) {
                    paginationOptions.iSortCols = null;
                } else {
                    paginationOptions.iSortCols = " Order By " + sortColumns[0].field + " " + sortColumns[0].sort.direction;
                }
                getDisplayRecords();
            });
            $scope[ApiName].pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                paginationOptions.pageNumber = newPage;
                paginationOptions.iDisplayLength = pageSize;
                getDisplayRecords();
            });
            
            var _flag = $scope[GridOptionName] == undefined || $scope[GridOptionName] == "" ? false : $scope[GridOptionName].onRegisterExApi;
            if (_flag)
            {
                $scope[GridOptionName].onRegisterExApi(gridApi);
            }

        }
    };
    var getDisplayRecords = function () {
        var url = URL;//'@Url.Action("GetAllData", "Utility")';
        var data = {
            pageNumber: paginationOptions.pageNumber,
            iDisplayLength: paginationOptions.iDisplayLength,
            iDisplayStart: (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength,
            //sSearch:  paginationOptions.sSearch += sSearch,
            sSearch: paginationOptions.sSearch,
            iSortCols: paginationOptions.iSortCols,
        };
        for (var i = 0; i < Paramdata.length; i++) {
            var obj = Paramdata[i];
            for (var key in obj) {
                var ParamName = key;
                var ParamValue = obj[key];
                data[ParamName] = ParamValue
            }
        }
        var config = {
            params: data,
            headers: { 'Accept': 'application/json' }
        };

        if ($scope[GridOptionName].HTTPMethod == undefined || $scope[GridOptionName].HTTPMethod == "GET") {
            $scope.promise = $http.get(url, config).success(function (data) {
                $scope[GridOptionName].totalItems = data.iTotalDisplayRecords;
                paginationOptions.iDisplayStart = (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength;
                if (typeof data.aaData === 'string' || data.aaData instanceof String) {
                    $scope[GridOptionName].data = data.aaData == undefined || data.aaData == null || data.aaData == "" ? [] : JSON.parse(data.aaData);
                }
                else {
                    $scope[GridOptionName].data = data.aaData == undefined || data.aaData == null ? [] : data.aaData;
                }
                $scope.height = (($scope[GridOptionName].data.length * 30) + 30);
                $scope.height += 80;
                loaderHide();
                if ($scope.CallBack == 1) {
                    //if (data.aaData.length == 0)
                        $scope.CallBackFunction();
                }
                paginationOptions.sSearch = "";
                sSearch = "";
            }).error(function (data) {
                loaderHide();
            });
        } else {
            $scope.promise = $http.post(url, data).success(function (data) {
                $scope[GridOptionName].totalItems = data.iTotalDisplayRecords;
                paginationOptions.iDisplayStart = (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength;
                if (typeof data.aaData === 'string' || data.aaData instanceof String) {
                    $scope[GridOptionName].data = JSON.parse(data.aaData);
                }
                else {
                    $scope[GridOptionName].data = data.aaData;
                }
                $scope.height = (($scope[GridOptionName].data.length * 30) + 30);
                $scope.height += 80;
                loaderHide();
                if ($scope.CallBack == 1) {
                   // if (data.aaData.length == 0)
                        $scope.CallBackFunction();
                }
                paginationOptions.sSearch = "";
                sSearch = "";

            }).error(function (data) {
                loaderHide();
            });
        }
    };

    getDisplayRecords();
}



// For ManufacturingMemoIssue.cshtml Page
function GriedParamPush($scope, $http, $q, $interval, uiGridConstants, URL, header, GridOptionName) {
    var paginationOptions = {
        pageNumber: 1,
        iDisplayStart: 0,
        iDisplayLength: 25,
        sSearch: sSearch,
        iSortCols: null
    };
    $scope[GridOptionName] = {
        paginationPageSizes: [5, 25, 50, 75],
        paginationPageSize: paginationOptions.iDisplayLength,
        useExternalPagination: true,
        useExternalSorting: true,
        useExternalFiltering: true,
        enableColumnResizing: true,
        columnDefs:
           header
        ,
        /* START Grid Option  */
        enableGridMenu: true,
        // enableSelectAll: true,
        // exporterMenuPdf: false, // ADD THIS
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
        exporterPdfHeader: { text: "My Header", style: 'headerStyle' },

        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'portrait',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        /* END Grid Option  */
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridApiParam = gridApi;
            $scope.gridApi.core.on.filterChanged($scope, function () {
                var grid = this.grid;
                paginationOptions.sSearch = "";
                for (var i = 0; i < grid.columns.length; i++) {
                    if (grid.columns[i].cellClass == "InQueryInt") {
                        var searchTmp = grid.columns[i].filters[0].term.trim().replace(/,\s*$/, "");
                        if (searchTmp != "") {
                            paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " in (" + searchTmp + ")";
                        }
                        else {
                            paginationOptions.sSearch = "";
                        }
                    }
                    else if (grid.columns[i].colDef.type == "boolean") {
                        var searchTmp = grid.columns[i].filters[0].term.trim().replace(/,\s*$/, "");
                        if ((searchTmp).toUpperCase().indexOf("T") != -1) {
                            paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " = " + 1;
                        }
                        else if ((searchTmp).toUpperCase().indexOf("F") != -1) {
                            paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " = " + 0;
                        }
                        else {
                            paginationOptions.sSearch = "";
                        }
                    }
                    else {
                        paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " like '%" + grid.columns[i].filters[0].term + "%'";
                    }
                }
                getDisplayRecords()
            });
            $scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                if (sortColumns.length == 0) {
                    paginationOptions.iSortCols = null;
                } else {
                    paginationOptions.iSortCols = " Order By " + sortColumns[0].field + " " + sortColumns[0].sort.direction;
                }
                getDisplayRecords();
            });
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                paginationOptions.pageNumber = newPage;
                paginationOptions.iDisplayLength = pageSize;
                getDisplayRecords();
            });

        }
    };
    var getDisplayRecords = function () {
        var url = URL;//'@Url.Action("GetAllData", "Utility")';
        var data = {
            pageNumber: paginationOptions.pageNumber,
            iDisplayLength: paginationOptions.iDisplayLength,
            iDisplayStart: (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength,
            sSearch: sSearch,
            iSortCols: paginationOptions.iSortCols,
        };
        for (var i = 0; i < Paramdata.length; i++) {
            var obj = Paramdata[i];
            for (var key in obj) {
                var ParamName = key;
                var ParamValue = obj[key];
                data[ParamName] = ParamValue
            }
        }

        var config = {
            params: data,
            headers: { 'Accept': 'application/json' }
        };
        $scope.promise = $http.get(url, config).success(function (data) {
            if ($scope.IsPushMethod == 0) {
                if (data.totalNotRecords != "") {
                    toastr["info"]("Record Not Found : 0 ")
                }
            }

            $scope[GridOptionName].totalItems = data.iTotalDisplayRecords;
            paginationOptions.iDisplayStart = (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength;

            if (_.filter($scope.data).length > 0) {
                jQuery.each(_.filter($scope.data), function (i, val) {
                    if ($scope.IsPushMethod == 0) {
                        var PacketCreateId = data.aaData[i].Packet_Create_Id
                        if (val.Packet_Create_Id == PacketCreateId) // delete index
                        {
                            delete $scope.data[i];
                        }
                    }
                    else if ($scope.IsPushMethod == 1) {//for mix empissue return
                        for (var j = 0; j < data.aaData.length; j++) {
                            var PacketCreateId = data.aaData[j].Stone_ID
                            if (val.Stone_ID == PacketCreateId) // delete index
                            {
                                delete $scope.data[i];
                            }
                        }
                    }
                });
            }
            data.aaData.forEach(function (row, index) {
                try {
                    if ($scope.EmpIssueReturn.Status == "Issue" || row.employee_id == 0) {
                        row.employee_id = $scope.EmpIssueReturn.EmpId;
                    }
                    $scope.data.push(row);

                } catch (e) { }
                
            });
            $scope[GridOptionName].data = _.filter($scope.data);
            $scope.height = (($scope[GridOptionName].data.length * 30) + 30);
            $scope.height += 80;


        });
    };

    getDisplayRecords();
}




var reSize = function (rows) {
    // This will adjust the css after the Data is loaded
    var newHeight = (rows * 30) + 60;
    angular.element(document.getElementsByClassName('grid')[0]).css('height', newHeight + 'px');

};


function GriedAddRow($scope) {

    var filed = {};
    if (!$scope.rowCol) {
        $scope.gridOptions.columnDefs.forEach(function (h) {
            if (h.field == "RowInfo") {
                filed[h.field] = 'NEW'
            }
            else {
                filed[h.field] = '';
            }
        });
        $scope.gridOptions.data.push(filed)
        return
    }

    var index = $scope.gridOptions.data.indexOf($scope.rowCol.row.entity);
    if (index < 0) {
    }
    $scope.gridOptions.columnDefs.forEach(function (h) {
        if (h.field == "RowInfo") {
            filed[h.field] = 'NEW'
        }
        else {
            filed[h.field] = '';
        }
    });
    $scope.gridOptions.data.splice(index, 0, filed);


    //  $scope.gridOptions.data.push(filed)//last row insert as new edit mode
    //$scope.gridOptions.data.unshift(filed);//first row insert as new edit mode
}


function GriedAddRowOption($scope, GridOptionName) {
    var filed = {};
    $scope[GridOptionName].columnDefs.forEach(function (h) {
        if (h.field == "RowInfo") {
            filed[h.field] = 'NEW'
        }
        else {
            filed[h.field] = '';
        }
    });
    $scope[GridOptionName].data.push(filed)

}

function ValidateRequired() {
    var retVal = false;
    $('.wrapper :input[required="required"]').each(function () {
        if (!this.validity.valid) {
            $(this).focus();
            // break
            if (!$(this).attr("ngMessage") == false) {
                toast($(this).attr("ngMessage"));
            }
            retVal = false;
            return false;
        }
        else {
            retVal = true;
        }
    });

    return retVal;

}
/*End stable version */

module.directive("decimals", function ($filter) {
    // Example : <input type="text" class="form-control input-sm" ng-model="PartyMaster.discountdifference" decimals="2" decimal-point=".">
    return {
        restrict: "A", // Only usable as an attribute of another HTML element
        require: "?ngModel",
        scope: {
            decimals: "@",
            decimalPoint: "@"
        },
        link: function (scope, element, attr, ngModel) {
            var decimalCount = parseInt(scope.decimals) || 2;
            var decimalPoint = scope.decimalPoint || ".";
            // Run when the model is first rendered and when the model is changed from code
            ngModel.$render = function () {
                if (ngModel.$modelValue != null && ngModel.$modelValue >= 0) {
                    if (typeof decimalCount === "number") {
                        element.val(ngModel.$modelValue.toFixed(decimalCount).toString().replace(".", "."));
                        //element.val(ngModel.$modelValue.toFixed(decimalCount).toString().replace(".", ","));
                    } else {
                        element.val(ngModel.$modelValue.toString().replace(".", "."));
                        //element.val(ngModel.$modelValue.toString().replace(".", ","));
                    }
                }
            }

            // Run when the view value changes - after each keypress
            // The returned value is then written to the model
            ngModel.$parsers.unshift(function (newValue) {
                if (typeof decimalCount === "number") {
                    var floatValue = parseFloat(newValue.replace(",", "."));
                    if (decimalCount === 0) {
                        return parseInt(floatValue);
                    }
                    return parseFloat(floatValue.toFixed(decimalCount));
                }

                return parseFloat(newValue.replace(",", "."));
            });

            // Formats the displayed value when the input field loses focus
            element.on("change", function (e) {
                var floatValue = parseFloat(element.val().replace(",", "."));
                if (!isNaN(floatValue) && typeof decimalCount === "number") {
                    if (decimalCount === 0) {
                        element.val(parseInt(floatValue));
                    } else {
                        var strValue = floatValue.toFixed(decimalCount);
                        element.val(strValue.replace(".", decimalPoint));
                    }
                }
            });
        }
    }
});

module.directive('ngController', function () {
    return {
        require: '?ngModel',
        restrict: 'A',
        link: function (scope, element, attr, ctrl) {
            scope.delay = 0;
            scope.minDuration = 0;
            scope.message = 'Please Wait...';
            scope.backdrop = true;
            scope.promise = null;
        }
    };
});

module.directive('onlyDigits', function () {
    return {
        require: '?ngModel',
        restrict: 'A',
        link: function (scope, element, attr, ctrl) {
            function inputValue(val) {
                if (val) {
                    var digits = val.replace(/[^0-9]/g, '');

                    if (digits !== val) {
                        ctrl.$setViewValue(digits);
                        ctrl.$render();
                    }
                    return parseInt(digits, 10);
                }
                return undefined;
            }
            ctrl.$parsers.push(inputValue);

        }
    };
});


module.directive('validatealphanumericmulti', function () {
    return {
        require: '?ngModel',
        restrict: 'A',
        link: function (scope, element, attr, ctrl) {
            function inputValue(val) {
                debugger
                if (val) {
                    var digits = val.replace(/[^0-9\,\/,/]/g, '');

                    if (digits !== val) {
                        ctrl.$setViewValue(digits);
                        ctrl.$render();
                    }
                    return digits;
                }
                return undefined;
            }
            ctrl.$parsers.push(inputValue);

        }
    };
});

module.directive('decimalNumber', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) {
                return;
            }

            ngModelCtrl.$parsers.push(function (val) {
                if (angular.isUndefined(val)) {
                    var val = '';
                }

                var clean = val.replace(/[^-0-9\.]/g, '');
                var negativeCheck = clean.split('-');
                var decimalCheck = clean.split('.');
                if (!angular.isUndefined(negativeCheck[1])) {
                    negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                    clean = negativeCheck[0] + '-' + negativeCheck[1];
                    if (negativeCheck[0].length > 0) {
                        clean = negativeCheck[0];
                    }

                }

                if (!angular.isUndefined(decimalCheck[1])) {
                    decimalCheck[1] = decimalCheck[1].slice(0, 2);
                    clean = decimalCheck[0] + '.' + decimalCheck[1];
                }

                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });

            element.bind('keypress', function (event) {
                if (event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    }
});

module.directive('validNumber', function () {

    //This module Support Property :  (1:valid-number) (2:allow-decimal="false/True") (3:allow-negative="false/True") (4:decimal-upto="1/2/3/ upto 100....")
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            element.on('keydown', function (event) {
                var keyCode = []
                if (attrs.allowNegative == "true") {
                    keyCode = [8, 9, 36, 35, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 109, 110, 173, 190, 189];
                }
                else {
                    var keyCode = [8, 9, 36, 35, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 173, 190];
                }


                if (attrs.allowDecimal == "false") {

                    var index = keyCode.indexOf(190);


                    if (index > -1) {
                        keyCode.splice(index, 1);
                    }

                }
                if ($.inArray(event.which, keyCode) == -1) event.preventDefault();
                else {
                    //console.log(2);
                    var oVal = ngModelCtrl.$modelValue || '';
                    if ($.inArray(event.which, [109, 173]) > -1 && oVal.indexOf('-') > -1) event.preventDefault();
                    else if ($.inArray(event.which, [110, 190]) > -1 && oVal.indexOf('.') > -1) event.preventDefault();
                }
            })
            .on('blur', function () {

                if (element.val() == '' || parseFloat(element.val()) == 0.0 || element.val() == '-') {
                    ngModelCtrl.$setViewValue('0.00');
                }
                else if (attrs.allowDecimal == "false") {
                    ngModelCtrl.$setViewValue(element.val());
                }
                else {
                    if (attrs.decimalUpto) {
                        var fixedValue = parseFloat(element.val()).toFixed(attrs.decimalUpto);
                    }
                    else { var fixedValue = parseFloat(element.val()).toFixed(2); }
                    ngModelCtrl.$setViewValue(fixedValue);
                }



                ngModelCtrl.$render();
                scope.$apply();
            });

            ngModelCtrl.$parsers.push(function (text) {
                var oVal = ngModelCtrl.$modelValue;
                var nVal = ngModelCtrl.$viewValue;
                //console.log(nVal);
                if (parseFloat(nVal) != nVal) {

                    if (nVal === null || nVal === undefined || nVal == '' || nVal == '-') oVal = nVal;

                    ngModelCtrl.$setViewValue(oVal);
                    ngModelCtrl.$render();

                    return oVal;
                }
                else {
                    var decimalCheck = nVal.split('.');
                    if (!angular.isUndefined(decimalCheck[1])) {
                        if (attrs.decimalUpto)
                            decimalCheck[1] = decimalCheck[1].slice(0, attrs.decimalUpto);
                        else
                            decimalCheck[1] = decimalCheck[1].slice(0, 2);
                        nVal = decimalCheck[0] + '.' + decimalCheck[1];
                    }

                    ngModelCtrl.$setViewValue(nVal);
                    ngModelCtrl.$render();
                    return nVal;
                }
            });

            ngModelCtrl.$formatters.push(function (text) {
                if (text == '0' || text == null && attrs.allowDecimal == "false") {
                    ngModelCtrl.$setViewValue("0");
                    return 0;
                }
                else if (text == '0' || text == null && attrs.allowDecimal != "false" && attrs.decimalUpto == undefined) {
                    ngModelCtrl.$setViewValue("0.00");
                    return '0.00';
                }
                else if (text == '0' || text == null && attrs.allowDecimal != "false" && attrs.decimalUpto != undefined) {
                    ngModelCtrl.$setViewValue(parseFloat(0).toFixed(attrs.decimalUpto));
                    return parseFloat(0).toFixed(attrs.decimalUpto);
                }
                else if (attrs.allowDecimal != "false" && attrs.decimalUpto != undefined) {
                    ngModelCtrl.$setViewValue(parseFloat(text).toFixed(attrs.decimalUpto));
                    return parseFloat(text).toFixed(attrs.decimalUpto);
                }
                else {
                    ngModelCtrl.$setViewValue(parseFloat(text).toFixed(2));
                    return parseFloat(text).toFixed(2);
                }
            });

        }
    };
});

module.directive('onlyCts', function () {

    //This module Support Property :  (1:valid-number) (2:allow-decimal="false/True") (3:allow-negative="false/True") (4:decimal-upto="1/2/3/ upto 100....")
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            element.on('keydown', function (event) {
                var keyCode = []
                if (attrs.allowNegative == "true") {
                    keyCode = [8, 9, 36, 35, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 109, 110, 173, 190, 189];
                }
                else {
                    var keyCode = [8, 9, 36, 35, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 173, 190];
                }


                if (attrs.allowDecimal == "false") {

                    var index = keyCode.indexOf(190);


                    if (index > -1) {
                        keyCode.splice(index, 1);
                    }

                }
                if ($.inArray(event.which, keyCode) == -1) event.preventDefault();
                else {
                    //console.log(2);
                    var oVal = ngModelCtrl.$modelValue || '';
                    if ($.inArray(event.which, [109, 173]) > -1 && oVal.indexOf('-') > -1) event.preventDefault();
                    else if ($.inArray(event.which, [110, 190]) > -1 && oVal.indexOf('.') > -1) event.preventDefault();
                }
            })
            .on('blur', function () {

                if (element.val() == '' || parseFloat(element.val()) == 0.0 || element.val() == '-') {
                    ngModelCtrl.$setViewValue('0.000');
                }
                else if (attrs.allowDecimal == "false") {
                    ngModelCtrl.$setViewValue(element.val());
                }
                else {
                    if (attrs.decimalUpto) {
                        var fixedValue = parseFloat(element.val()).toFixed(attrs.decimalUpto);
                    }
                    else { var fixedValue = parseFloat(element.val()).toFixed(3); }
                    ngModelCtrl.$setViewValue(fixedValue);
                }



                ngModelCtrl.$render();
                scope.$apply();
            });

            ngModelCtrl.$parsers.push(function (text) {
                var oVal = ngModelCtrl.$modelValue;
                var nVal = ngModelCtrl.$viewValue;
                //console.log(nVal);
                if (parseFloat(nVal) != nVal) {

                    if (nVal === null || nVal === undefined || nVal == '' || nVal == '-') oVal = nVal;

                    ngModelCtrl.$setViewValue(oVal);
                    ngModelCtrl.$render();

                    return oVal;
                }
                else {
                    var decimalCheck = nVal.split('.');
                    if (!angular.isUndefined(decimalCheck[1])) {
                        if (attrs.decimalUpto)
                            decimalCheck[1] = decimalCheck[1].slice(0, attrs.decimalUpto);
                        else
                            decimalCheck[1] = decimalCheck[1].slice(0, 3);
                        nVal = decimalCheck[0] + '.' + decimalCheck[1];
                    }

                    ngModelCtrl.$setViewValue(nVal);
                    ngModelCtrl.$render();
                    return nVal;
                }
            });

            ngModelCtrl.$formatters.push(function (text) {
                if (text == '0' || text == null && attrs.allowDecimal == "false") {
                    ngModelCtrl.$setViewValue("0");
                    return 0;
                }
                else if (text == '0' || text == null && attrs.allowDecimal != "false" && attrs.decimalUpto == undefined) {
                    ngModelCtrl.$setViewValue("0.000");
                    return '0.000';
                }
                else if (text == '0' || text == null && attrs.allowDecimal != "false" && attrs.decimalUpto != undefined) {
                    ngModelCtrl.$setViewValue(parseFloat(0).toFixed(attrs.decimalUpto));
                    return parseFloat(0).toFixed(attrs.decimalUpto);
                }
                else if (attrs.allowDecimal != "false" && attrs.decimalUpto != undefined) {
                    ngModelCtrl.$setViewValue(parseFloat(text).toFixed(attrs.decimalUpto));
                    return parseFloat(text).toFixed(attrs.decimalUpto);
                }
                else {
                    ngModelCtrl.$setViewValue(parseFloat(text).toFixed(3));
                    return parseFloat(text).toFixed(3);
                }
            });

        }
    };
});

module.directive('validatealphanumeric', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs, ctrl) {
            elm.on('keydown', function (event) {
                var $input = $(this);
                var value = $input.val();
                value = value.replace(/[^a-zA-Z0-9]/g, '')
                $input.val(value);
                if (event.which == 64 || event.which == 16) {
                    // to allow numbers  
                    return false;
                } else if (event.which >= 48 && event.which <= 57) {
                    // to allow numbers  
                    return true;
                }
                else if (event.which >= 65 && event.which <= 90) {
                    // to alpah capital numbers  
                    return true;
                } else if (event.which >= 97 && event.which <= 172) {
                    // to alpah alpha numbers  
                    return true;
                }
                else if (event.which >= 96 && event.which <= 105) {
                    // to allow numpad number  
                    return true;
                } else if ([8, 9, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
                    // to allow backspace, enter, escape, arrows  
                    return true;
                } else {
                    event.preventDefault();
                    // to stop others  
                    //alert("Sorry Only Numbers Allowed");  
                    return false;
                }
            }
            );
        }
    }
});

module.directive('setDefaultvalue', function () {
    //Example <input type="text" class="form-control input-sm" ng-model="Test" set-Defaultvalue defalut-Value="123456">
    //Example <select class="form-control input-sm" ng-model="PartyMaster.BusinessTypeID" style="width: 100%;" ng-options="item.Business_Type_Id as item.BussinessName for item in BusinessTypes"  set-Defaultvalue defalut-Value="2">
    //Example <input type="checkbox" value="1" ng-model="PartyMaster.allowonlinebuy" set-Defaultvalue defalut-Value="0"> Allow&nbsp;onlineBuy

    return {
        require: '?ngModel',
        scope: {
            defalutValue: "@"
        },
        restrict: 'A',
        link: function (scope, element, attr, ctrl) {
            var GetDefaultVal = parseInt(scope.defalutValue);
            if (!ctrl.$modelValue) {
                //ctrl.$formatters.push(GetDefaultVal)
                ctrl.$setViewValue(GetDefaultVal);
                ctrl.$render();
            }
        }
    };
});

module.filter('myDate', function ($filter) {
    return function (theDate) {
        if (theDate != undefined && theDate != "") {
            return $filter('date')(DotnetTojson(theDate), "dd/MMM/yyyy");
        }
        else {
            return "";
        }
    }
});

module.filter('my_Time', function ($filter) {
    return function (timeObj) {
        if (timeObj != undefined && timeObj != "") {
            var min = timeObj.Minutes < 10 ? "0" + timeObj.Minutes : timeObj.Minutes;
            var sec = timeObj.Seconds < 10 ? "0" + timeObj.Seconds : timeObj.Seconds;
            var hour = timeObj.Hours < 10 ? "0" + timeObj.Hours : timeObj.Hours;
            return (hour + ':' + min + ':' + sec);
        }
    };
});

module.filter('myTime', function ($filter) {
    return function (theDate) {
        if (theDate != undefined && theDate != "") {
            return $filter('date')(DotnetTojson(theDate), "hh:mm");
        }
        else {
            return "";
        }
    }
});

module.filter('myDateTime', function ($filter) {
    return function (theDate) {
        if (theDate != undefined && theDate != "") {
            return $filter('date')(DotnetTojson(theDate), "dd/MMM/yyyy hh:mm");
        }
        else {
            return "";
        }
    }
});

module.directive('replaceComma', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            scope.$watch(attrs.ngModel, function (newVal) {
                if (newVal !== undefined && newVal !== null) {
                    var Nval = newVal.split(/[ ]+/).filter(function (v) { return v !== '' }).join(',')
                    ngModelCtrl.$setViewValue(String(Nval).replace(/,,/g, ',').replace(/ /g, ','));
                    ngModelCtrl.$render();
                }
            });
            element.bind("keypress", function (event) {
                if (event.which === 44) {
                    if (scope[attrs.ngModel].slice(-1) == ",") {
                        event.preventDefault();
                    }
                }
                if (event.which === 13) {
                    if (scope[attrs.ngModel] != "" && scope[attrs.ngModel] != null && scope[attrs.ngModel] != undefined && scope[attrs.ngModel].slice(-1) != ",") {
                        ngModelCtrl.$setViewValue((scope[attrs.ngModel]) + ",");
                    }
                }
            });
        }
    }
});

module.directive('toggleClass', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ctrl) {
            element.bind('click', function (value) {
                if (attrs.ngName == "LAB") {
                    var LabId = parseInt(attrs.ngValue);
                    if (LAB.indexOf(LabId) == -1) {
                        LAB.push(LabId);
                    }
                    else {
                        removeA(LAB, LabId);
                    }
                } else if (attrs.ngName == "SHAPE") {

                    var ShapeId = parseInt(attrs.ngValue);
                    if (SHAPE.indexOf(ShapeId) == -1) {
                        SHAPE.push(ShapeId);
                    }
                    else {
                        removeA(SHAPE, ShapeId);
                    }
                } else if (attrs.ngName == "COLOR") {
                    debugger
                    var ColorId = attrs.ngValue;
                    if (COLOR.indexOf(ColorId) == -1) {
                        COLOR.push(ColorId);
                    }
                    else {
                        removeA(COLOR, ColorId);
                    }
                } else if (attrs.ngName == "CUT") {
                    var CutId = parseInt(attrs.ngValue);
                    if (CUT.indexOf(CutId) == -1) {
                        CUT.push(CutId);
                    }
                    else {
                        removeA(CUT, CutId);
                    }
                } else if (attrs.ngName == "CLARITY") {

                    var ClarityId = parseInt(attrs.ngValue);
                    if (CLARITY.indexOf(ClarityId) == -1) {
                        CLARITY.push(ClarityId);
                    }
                    else {
                        removeA(CLARITY, ClarityId);
                    }
                } else if (attrs.ngName == "POLISH") {

                    var PolishId = parseInt(attrs.ngValue);
                    if (POLISH.indexOf(PolishId) == -1) {
                        POLISH.push(PolishId);
                    }
                    else {
                        removeA(POLISH, PolishId);
                    }
                } else if (attrs.ngName == "SYMMENTRIC") {

                    var SymmId = parseInt(attrs.ngValue);
                    if (SYMM.indexOf(SymmId) == -1) {
                        SYMM.push(SymmId);
                    }
                    else {
                        removeA(SYMM, SymmId);
                    }
                }
                else if (attrs.ngName == "FLUORESCENCE") {
                    debugger
                    var FlourId = parseInt(attrs.ngValue);
                    if (FLUORESCENCE.indexOf(FlourId) == -1) {
                        FLUORESCENCE.push(FlourId);
                    }
                    else {
                        removeA(FLUORESCENCE, FlourId);
                    }
                } else if (attrs.ngName == "TINGE") {

                    var TingeId = parseInt(attrs.ngValue);
                    if (TINGE.indexOf(TingeId) == -1) {
                        TINGE.push(TingeId);
                    }
                    else {
                        removeA(TINGE, TingeId);
                    }
                } else if (attrs.ngName == "LUSTER") {

                    var LusterId = parseInt(attrs.ngValue);
                    if (LUSTER.indexOf(LusterId) == -1) {
                        LUSTER.push(LusterId);
                    }
                    else {
                        removeA(LUSTER, LusterId);
                    }
                } else if (attrs.ngName == "H&A") {

                    var H_AId = parseInt(attrs.ngValue);
                    if (H_A.indexOf(H_AId) == -1) {
                        H_A.push(H_AId);
                    }
                    else {
                        removeA(H_A, H_AId);
                    }
                } else if (attrs.ngName == "LOCATIONOFBLACK") {
                    var LocationBlackInclusionId = parseInt(attrs.ngValue);
                    if (LOCATIONOFBLACK.indexOf(LocationBlackInclusionId) == -1) {
                        LOCATIONOFBLACK.push(LocationBlackInclusionId);
                    }
                    else {
                        removeA(LOCATIONOFBLACK, LocationBlackInclusionId);
                    }
                } else if (attrs.ngName == "BLACK INCLUSION(CLIENT)") {
                    var BlackInclusionId = parseInt(attrs.ngValue);
                    if (BLACKINCLUSION.indexOf(BlackInclusionId) == -1) {
                        BLACKINCLUSION.push(BlackInclusionId);
                    }
                    else {
                        removeA(BLACKINCLUSION, BlackInclusionId);
                    }
                } else if (attrs.ngName == "NATTS") {
                    var NattasId = parseInt(attrs.ngValue);
                    if (NATTAS.indexOf(NattasId) == -1) {
                        NATTAS.push(NattasId);
                    }
                    else {
                        removeA(NATTAS, NattasId);
                    }
                } else if (attrs.ngName == "INTENSITY_BLK") {
                    var IntensityBlkId = parseInt(attrs.ngValue);
                    if (INTENSITYBLK.indexOf(IntensityBlkId) == -1) {
                        INTENSITYBLK.push(IntensityBlkId);
                    }
                    else {
                        removeA(INTENSITYBLK, IntensityBlkId);
                    }
                } else if (attrs.ngName == "TABLE INCLUSION") {
                    var TableInclusionId = parseInt(attrs.ngValue);
                    if (TABLEINCLUSION.indexOf(TableInclusionId) == -1) {
                        TABLEINCLUSION.push(TableInclusionId);
                    }
                    else {
                        removeA(TABLEINCLUSION, TableInclusionId);
                    }
                } else if (attrs.ngName == "SURFACE GRAINING") {
                    var SurfaceGradingId = parseInt(attrs.ngValue);
                    if (SURFACEGRAINING.indexOf(SurfaceGradingId) == -1) {
                        SURFACEGRAINING.push(SurfaceGradingId);
                    }
                    else {
                        removeA(SURFACEGRAINING, SurfaceGradingId);
                    }
                } else if (attrs.ngName == "INTERNAL GRAINING") {
                    var InternalgrainingId = parseInt(attrs.ngValue);
                    if (INTERNALGRAINING.indexOf(InternalgrainingId) == -1) {
                        INTERNALGRAINING.push(InternalgrainingId);
                    }
                    else {
                        removeA(INTERNALGRAINING, InternalgrainingId);
                    }
                } else if (attrs.ngName == "CARAT") {
                    var CarateId = attrs.ngValue;
                    if (CARAT.indexOf(CarateId) == -1) {
                        CARAT.push(CarateId);
                    }
                    else {
                        removeA(CARAT, CarateId);
                    }
                } else if (attrs.ngName == "INTENSITY") {
                    var FncintencyId = attrs.ngValue;
                    if (FNCINTENSITY.indexOf(FncintencyId) == -1) {
                        FNCINTENSITY.push(FncintencyId);
                    }
                    else {
                        removeA(FNCINTENSITY, FncintencyId);
                    }
                } else if (attrs.ngName == "FNC OVERTONE") {
                    var FncOverToneId = attrs.ngValue;
                    if (FNCOVERTONE.indexOf(FncOverToneId) == -1) {
                        FNCOVERTONE.push(FncOverToneId);
                    }
                    else {
                        removeA(FNCOVERTONE, FncOverToneId);
                    }
                }

                element.toggleClass(attrs.toggleClass);

                // debugger
                scope.GetSearchStone()

            });
        }
    };
});

// Clipboard grid
module.directive('uiGridCellSelection', function ($compile) {
    /*
    Proof of concept, in reality we need on/off events etc.
    */
    return {
        require: 'uiGrid',
        link: function(scope, element, attrs, uiGridCtrl){
            // Taken from cellNav
            //add an element with no dimensions that can be used to set focus and capture keystrokes
            var gridApi = uiGridCtrl.grid.api
            var focuser = $compile('<div class="ui-grid-focuser" tabindex="-1"></div>')(scope);
            element.append(focuser);

            uiGridCtrl.focus = function () {
                focuser[0].focus();
            };

              
            gridApi.cellNav.on.viewPortKeyDown(scope, function(e){
                if((e.keyCode===99 || e.keyCode===67) && e.ctrlKey){
                    var cells = gridApi.cellNav.getCurrentSelection();
                    var copyString = '',
                     rowId = cells[0].row.uid;
                    angular.forEach(cells,function(cell){
                        if (cell.row.uid !== rowId){
                            copyString += '\n';
                            rowId = cell.row.uid;
                        }
                        copyString += gridApi.grid.getCellValue(cell.row, cell.col).toString();
                        copyString += ', ';
           
                    })
                    // Yes, this should be build into a directive, but this is a quick and dirty example.
                    var textArea = document.getElementById("grid-clipboard");
                    textArea.value = copyString;
                    textArea = document.getElementById("grid-clipboard").select();
                }
            })
            focuser.on('keyup', function(e){
        
            })
        }
    }
}).directive('uiGridClipboard', function(){
    return {
        template: '<textarea id="grid-clipboard" ng-model="uiGridClipBoardContents"></textarea>',
        replace: true,
        link: function(scope, element, attrs){
            // Obviously this needs to be hidden better (probably a z-index, and positioned behind something opaque)
            element.css('height', '1px');
            element.css('width', '1px');
            element.css('resize', 'none');
        }
    };
});

angular.module('buttonToggle', []).directive('buttonToggle', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function ($scope, element, attr, ctrl) {
            debugger
            var classToToggle = attr.buttonToggle;
            element.bind('click', function () {
                element.toggleClass(attrs.toggleClass);
                var checked = ctrl.$viewValue;
                $scope.$apply(function (scope) {
                    ctrl.$setViewValue(!checked);
                });
            });

            $scope.$watch(attr.ngModel, function (newValue, oldValue) {
                newValue ? element.addClass(classToToggle) : element.removeClass(classToToggle);
            });
        }
    };
});

module.directive('ngCurrency', function ($filter, $locale) {
    return {
        require: 'ngModel',
        scope: {
            min: '=min',
            max: '=max',
            ngRequired: '=ngRequired'
        },
        link: function (scope, element, attrs, ngModel) {
            debugger
            function decimalRex(dChar) {
                return RegExp("\\d|\\" + dChar, 'g')
            }

            function clearRex(dChar) {
                return RegExp("((\\" + dChar + ")|([0-9]{1,}\\" + dChar + "?))&?[0-9]{0,2}", 'g');
            }

            function decimalSepRex(dChar) {
                return RegExp("\\" + dChar, "g")
            }

            function clearValue(value) {
                value = String(value);
                var dSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP;
                var clear = null;

                if (value.match(decimalSepRex(dSeparator))) {
                    clear = value.match(decimalRex(dSeparator))
                        .join("").match(clearRex(dSeparator));
                    clear = clear ? clear[0].replace(dSeparator, ".") : null;
                }
                else if (value.match(decimalSepRex("."))) {
                    clear = value.match(decimalRex("."))
                        .join("").match(clearRex("."));
                    clear = clear ? clear[0] : null;
                }
                else {
                    clear = value.match(/\d/g);
                    clear = clear ? clear.join("") : null;
                }

                return clear;
            }

            ngModel.$parsers.push(function (viewValue) {
                cVal = clearValue(viewValue);
                return parseFloat(cVal);
            });

            element.on("blur", function () {
                var val = $filter('currency')(ngModel.$modelValue);
                val = val.trim().replace("$", "")
                element.val(val);
            });

            ngModel.$formatters.unshift(function (value) {
                var val = $filter('currency')(ngModel.$modelValue);
                val = val.trim().replace("$", "")
                return val;
            });

            scope.$watch(function () {
                return ngModel.$modelValue
            }, function (newValue, oldValue) {
                runValidations(newValue)
            })

            function runValidations(cVal) {
                if (!scope.ngRequired && isNaN(cVal)) {
                    return
                }
                if (scope.min) {
                    var min = parseFloat(scope.min)
                    ngModel.$setValidity('min', cVal >= min)
                }
                if (scope.max) {
                    var max = parseFloat(scope.max)
                    ngModel.$setValidity('max', cVal <= max)
                }
            }
        }
    }
});

module.directive('ngConfirmClick', [function () {
    return {
        priority: 1,
        terminal: true,
        link: function (scope, element, attr) {
            var msg = attr.ngConfirmClick || "Are you sure?";
            var clickAction = attr.ngClick;
            element.bind('click', function (event) {
                alertify.confirm(msg, function (e) {
                    if (e) {
                        scope.$eval(clickAction)
                    } else {
                        return
                    }
                });

                //if (window.confirm(msg)) {
                //    scope.$eval(clickAction)
                //}
            });
        }
    };
}])

module.directive('onErrorSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    }
});

module.directive('validateEmail', function () {
    var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
    return {
        link: function (scope, elm) {
            elm.on("keyup", function () {
                var isMatchRegex = EMAIL_REGEXP.test(elm.val());
                if (isMatchRegex && elm.hasClass('warning') || elm.val() == '') {
                    elm.removeClass('warning');
                } else if (isMatchRegex == false && !elm.hasClass('warning')) {
                    elm.addClass('warning');
                }
            });
        }
    }
});

module.directive('setHeight', function ($window) {
    return {
        link: function (scope, element, attrs) {
            //var d = document, root = d.documentElement, body = d.body;
            //var wid = window.innerWidth || root.clientWidth || body.clientWidth,
            //hi = window.innerHeight || root.clientHeight || body.clientHeight;

            element.css('height', ((parseFloat($window.innerHeight) - parseFloat($(element).offset().top)) - 24) + 'px');
            //setTimeout(function () {
            //    element.css('height', ((parseFloat($window.innerHeight) - parseFloat($(element).offset().top)) - 24) + 'px');
            //}, 5000);
          
            //element.height($window.innerHeight/3);
            //alert(((parseFloat($window.innerHeight) - parseFloat($(element).offset().top)) - 40))
            //alert("Height :" + parseFloat($window.innerHeight) +" - Top To Grid : "+ parseFloat($(element).offset().top) );
        }
    }
})

module.directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return { 'h': w.height(), 'w': w.width() };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.style = function () {
                return {
                    'height': (newValue.h - 100) + 'px',
                    'width': (newValue.w - 100) + 'px'
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
})

module.directive('focusMe', function ($timeout) {
    return {
        link: function (scope, element, attrs, model) {
            $timeout(function () {
                element[0].focus();
            });
        }
    };
});

module.filter('noround', function () {
    return function (floatNum) {
        var _d = isNaN(floatNum) == true ? floatNum : 0.000;
        console.log(floatNum);
        if (floatNum != undefined && floatNum != null && floatNum != "") {
            _d = String(floatNum)
            .split('.')
            .map(function (d, i) { return i ? d.substr(0, 3) : d; })
            .join('.');
        }
        return parseFloat(_d).toFixed(3);
    };
});

//module.service('uiGridCellNavService', ['gridUtil', 'uiGridConstants', 'uiGridCellNavConstants', '$q', 'uiGridCellNavFactory', 'GridRowColumn', 'ScrollEvent',
//    function (gridUtil, uiGridConstants, uiGridCellNavConstants, $q, UiGridCellNav, GridRowColumn, ScrollEvent) {

//        var service = {

//            initializeGrid: function (grid) {
//                grid.registerColumnBuilder(service.cellNavColumnBuilder);

//                /**
//                 *  @ngdoc object
//                 *  @name ui.grid.cellNav:Grid.cellNav
//                 * @description cellNav properties added to grid class
//                 */
//                grid.cellNav = {};
//                grid.cellNav.lastRowCol = null;
//                grid.cellNav.focusedCells = [];

//                service.defaultGridOptions(grid.options);

//                /**
//                 *  @ngdoc object
//                 *  @name ui.grid.cellNav.api:PublicApi
//                 *
//                 *  @description Public Api for cellNav feature
//                 */
//                var publicApi = {
//                    events: {
//                        cellNav: {
//                            /**
//                             * @ngdoc event
//                             * @name navigate
//                             * @eventOf  ui.grid.cellNav.api:PublicApi
//                             * @description raised when the active cell is changed
//                             * <pre>
//                             *      gridApi.cellNav.on.navigate(scope,function(newRowcol, oldRowCol){})
//                             * </pre>
//                             * @param {object} newRowCol new position
//                             * @param {object} oldRowCol old position
//                             */
//                            navigate: function (newRowCol, oldRowCol) { },
//                            /**
//                             * @ngdoc event
//                             * @name viewPortKeyDown
//                             * @eventOf  ui.grid.cellNav.api:PublicApi
//                             * @description  is raised when the viewPort receives a keyDown event. Cells never get focus in uiGrid
//                             * due to the difficulties of setting focus on a cell that is not visible in the viewport.  Use this
//                             * event whenever you need a keydown event on a cell
//                             * <br/>
//                             * @param {object} event keydown event
//                             * @param {object} rowCol current rowCol position
//                             */
//                            viewPortKeyDown: function (event, rowCol) { },

//                            /**
//                             * @ngdoc event
//                             * @name viewPortKeyPress
//                             * @eventOf  ui.grid.cellNav.api:PublicApi
//                             * @description  is raised when the viewPort receives a keyPress event. Cells never get focus in uiGrid
//                             * due to the difficulties of setting focus on a cell that is not visible in the viewport.  Use this
//                             * event whenever you need a keypress event on a cell
//                             * <br/>
//                             * @param {object} event keypress event
//                             * @param {object} rowCol current rowCol position
//                             */
//                            viewPortKeyPress: function (event, rowCol) { }
//                        }
//                    },
//                    methods: {
//                        cellNav: {
//                            /**
//                             * @ngdoc function
//                             * @name scrollToFocus
//                             * @methodOf  ui.grid.cellNav.api:PublicApi
//                             * @description brings the specified row and column into view, and sets focus
//                             * to that cell
//                             * @param {object} rowEntity gridOptions.data[] array instance to make visible and set focus
//                             * @param {object} colDef to make visible and set focus
//                             * @returns {promise} a promise that is resolved after any scrolling is finished
//                             */
//                            scrollToFocus: function (rowEntity, colDef) {
//                                return service.scrollToFocus(grid, rowEntity, colDef);
//                            },

//                            /**
//                             * @ngdoc function
//                             * @name getFocusedCell
//                             * @methodOf  ui.grid.cellNav.api:PublicApi
//                             * @description returns the current (or last if Grid does not have focus) focused row and column
//                             * <br> value is null if no selection has occurred
//                             */
//                            getFocusedCell: function () {
//                                return grid.cellNav.lastRowCol;
//                            },

//                            /**
//                             * @ngdoc function
//                             * @name getCurrentSelection
//                             * @methodOf  ui.grid.cellNav.api:PublicApi
//                             * @description returns an array containing the current selection
//                             * <br> array is empty if no selection has occurred
//                             */
//                            getCurrentSelection: function () {
//                                return grid.cellNav.focusedCells;
//                            },

//                            /**
//                             * @ngdoc function
//                             * @name rowColSelectIndex
//                             * @methodOf  ui.grid.cellNav.api:PublicApi
//                             * @description returns the index in the order in which the GridRowColumn was selected, returns -1 if the GridRowColumn
//                             * isn't selected
//                             * @param {object} rowCol the rowCol to evaluate
//                             */
//                            rowColSelectIndex: function (rowCol) {
//                                //return gridUtil.arrayContainsObjectWithProperty(grid.cellNav.focusedCells, 'col.uid', rowCol.col.uid) &&
//                                var index = -1;
//                                for (var i = 0; i < grid.cellNav.focusedCells.length; i++) {
//                                    if (grid.cellNav.focusedCells[i].col.uid === rowCol.col.uid &&
//                                      grid.cellNav.focusedCells[i].row.uid === rowCol.row.uid) {
//                                        index = i;
//                                        break;
//                                    }
//                                }
//                                return index;
//                            }
//                        }
//                    }
//                };

//                grid.api.registerEventsFromObject(publicApi.events);

//                grid.api.registerMethodsFromObject(publicApi.methods);

//            },

//            defaultGridOptions: function (gridOptions) {
//                /**
//                 *  @ngdoc object
//                 *  @name ui.grid.cellNav.api:GridOptions
//                 *
//                 *  @description GridOptions for cellNav feature, these are available to be
//                 *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
//                 */

//                /**
//                 *  @ngdoc object
//                 *  @name modifierKeysToMultiSelectCells
//                 *  @propertyOf  ui.grid.cellNav.api:GridOptions
//                 *  @description Enable multiple cell selection only when using the ctrlKey or shiftKey.
//                 *  <br/>Defaults to false
//                 */
//                gridOptions.modifierKeysToMultiSelectCells = gridOptions.modifierKeysToMultiSelectCells === true;

//            },

//            /**
//             * @ngdoc service
//             * @name decorateRenderContainers
//             * @methodOf ui.grid.cellNav.service:uiGridCellNavService
//             * @description  decorates grid renderContainers with cellNav functions
//             */
//            decorateRenderContainers: function (grid) {

//                var rightContainer = grid.hasRightContainer() ? grid.renderContainers.right : null;
//                var leftContainer = grid.hasLeftContainer() ? grid.renderContainers.left : null;

//                if (leftContainer !== null) {
//                    grid.renderContainers.left.cellNav = new UiGridCellNav(grid.renderContainers.body, leftContainer, rightContainer, grid.renderContainers.body);
//                }
//                if (rightContainer !== null) {
//                    grid.renderContainers.right.cellNav = new UiGridCellNav(grid.renderContainers.body, rightContainer, grid.renderContainers.body, leftContainer);
//                }

//                grid.renderContainers.body.cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, leftContainer, rightContainer);
//            },

//            /**
//             * @ngdoc service
//             * @name getDirection
//             * @methodOf ui.grid.cellNav.service:uiGridCellNavService
//             * @description  determines which direction to for a given keyDown event
//             * @returns {uiGridCellNavConstants.direction} direction
//             */
//            getDirection: function (evt) {
//                if (evt.keyCode === uiGridConstants.keymap.LEFT || (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey)) {
//                    return uiGridCellNavConstants.direction.LEFT;
//                }
//                if (evt.keyCode === uiGridConstants.keymap.RIGHT || evt.keyCode === uiGridConstants.keymap.ENTER || evt.keyCode === uiGridConstants.keymap.TAB) {
//                    return uiGridCellNavConstants.direction.RIGHT;
//                }

//                if (evt.keyCode === uiGridConstants.keymap.DOWN ||evt.keyCode === uiGridConstants.keymap.ENTER && !(evt.ctrlKey || evt.altKey)) {
//                    return uiGridCellNavConstants.direction.DOWN;
//                }


//                if (evt.keyCode === uiGridConstants.keymap.ENTER && (evt.ctrlKey || evt.altKey)) {
//                    return uiGridCellNavConstants.direction.DOWN;
//                }

                

//                if (evt.keyCode === uiGridConstants.keymap.UP ||(evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey)) {

//                    return uiGridCellNavConstants.direction.UP;
//                }



                
//                if (evt.keyCode === uiGridConstants.keymap.PG_UP) {
//                    return uiGridCellNavConstants.direction.PG_UP;
//                }



//                if (evt.keyCode === uiGridConstants.keymap.PG_DOWN) {
//                    return uiGridCellNavConstants.direction.PG_DOWN;
//                }

//                return null;
//            },

//            /**
//             * @ngdoc service
//             * @name cellNavColumnBuilder
//             * @methodOf ui.grid.cellNav.service:uiGridCellNavService
//             * @description columnBuilder function that adds cell navigation properties to grid column
//             * @returns {promise} promise that will load any needed templates when resolved
//             */
//            cellNavColumnBuilder: function (colDef, col, gridOptions) {
//                var promises = [];

//                /**
//                 *  @ngdoc object
//                 *  @name ui.grid.cellNav.api:ColumnDef
//                 *
//                 *  @description Column Definitions for cellNav feature, these are available to be
//                 *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
//                 */

//                /**
//                 *  @ngdoc object
//                 *  @name allowCellFocus
//                 *  @propertyOf  ui.grid.cellNav.api:ColumnDef
//                 *  @description Enable focus on a cell within this column.
//                 *  <br/>Defaults to true
//                 */
//                colDef.allowCellFocus = colDef.allowCellFocus === undefined ? true : colDef.allowCellFocus;

//                return $q.all(promises);
//            },

//            /**
//             * @ngdoc method
//             * @methodOf ui.grid.cellNav.service:uiGridCellNavService
//             * @name scrollToFocus
//             * @description Scroll the grid such that the specified
//             * row and column is in view, and set focus to the cell in that row and column
//             * @param {Grid} grid the grid you'd like to act upon, usually available
//             * from gridApi.grid
//             * @param {object} rowEntity gridOptions.data[] array instance to make visible and set focus to
//             * @param {object} colDef to make visible and set focus to
//             * @returns {promise} a promise that is resolved after any scrolling is finished
//             */
//            scrollToFocus: function (grid, rowEntity, colDef) {
//                var gridRow = null, gridCol = null;

//                if (typeof (rowEntity) !== 'undefined' && rowEntity !== null) {
//                    gridRow = grid.getRow(rowEntity);
//                }

//                if (typeof (colDef) !== 'undefined' && colDef !== null) {
//                    gridCol = grid.getColumn(colDef.name ? colDef.name : colDef.field);
//                }
//                return grid.api.core.scrollToIfNecessary(gridRow, gridCol).then(function () {
//                    var rowCol = { row: gridRow, col: gridCol };

//                    // Broadcast the navigation
//                    if (gridRow !== null && gridCol !== null) {
//                        grid.cellNav.broadcastCellNav(rowCol);
//                    }
//                });



//            },


//            /**
//             * @ngdoc method
//             * @methodOf ui.grid.cellNav.service:uiGridCellNavService
//             * @name getLeftWidth
//             * @description Get the current drawn width of the columns in the
//             * grid up to the numbered column, and add an apportionment for the
//             * column that we're on.  So if we are on column 0, we want to scroll
//             * 0% (i.e. exclude this column from calc).  If we're on the last column
//             * we want to scroll to 100% (i.e. include this column in the calc). So
//             * we include (thisColIndex / totalNumberCols) % of this column width
//             * @param {Grid} grid the grid you'd like to act upon, usually available
//             * from gridApi.grid
//             * @param {gridCol} upToCol the column to total up to and including
//             */
//            getLeftWidth: function (grid, upToCol) {
//                var width = 0;

//                if (!upToCol) {
//                    return width;
//                }

//                var lastIndex = grid.renderContainers.body.visibleColumnCache.indexOf(upToCol);

//                // total column widths up-to but not including the passed in column
//                grid.renderContainers.body.visibleColumnCache.forEach(function (col, index) {
//                    if (index < lastIndex) {
//                        width += col.drawnWidth;
//                    }
//                });

//                // pro-rata the final column based on % of total columns.
//                var percentage = lastIndex === 0 ? 0 : (lastIndex + 1) / grid.renderContainers.body.visibleColumnCache.length;
//                width += upToCol.drawnWidth * percentage;

//                return width;
//            }
//        };

//        return service;
//    }]
//    );

module.directive('nextFocus', [function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.bind('keydown', function (e) {
                var code = e.keyCode || e.which;
                if (code === 13) {
                    e.preventDefault();
                    try {
                        if (attrs.tabindex !== undefined) {
                            var currentTabeIndex = attrs.tabindex;
                            var nextTabIndex = parseInt(currentTabeIndex) + 1;
                            var elems = document.querySelectorAll("[tabindex]");
                            for (var i = 0, len = elems.length; i < len; i++) {
                                var el = angular.element(elems[i]);
                                var idx = parseInt(el.attr('tabindex'));
                                if (idx === nextTabIndex) {
                                    elems[i].focus();
                                    break;
                                }
                            }
                        }
                    } catch (e) {
                        console.log('Focus error: ' + e);
                    }
                }
            });
        }
    };
}]);

module.filter('textDate', ['$filter', function ($filter) {
    return function (input, format) {
        var date;
        if (input == null)
            input = new Date();
        try {
            var date = $filter('date')(DotnetTojson(input), "dd/MM/yyyy");
        } catch (ex) {

            date = input;
        }
        return $filter('date')(date, format);
    };
}]);
module.directive('uiGridEditDatepicker', ['$timeout', '$document', 'uiGridConstants', 'uiGridEditConstants', function ($timeout, $document, uiGridConstants, uiGridEditConstants) {
    return {
        template: function (element, attrs) {
            var html = '<div class="datepicker-wrapper" ><input uib-datepicker-popup is-open="isOpen" ui-date="{ dateFormat: \'dd mm yyyy\' }" ui-date-format="dd mm yyyy" ng-model="' + attrs.rowField + '" ng-change="changeDate($event)" on-open-focus="false" disabled/></div>';
            return html;
        },
        require: ['?^uiGrid', '?^uiGridRenderContainer'],
        scope: true,
        compile: function () {
            return {
                pre: function ($scope, $elm, $attrs) {

                },
                post: function ($scope, $elm, $attrs, controllers) {
                    var setCorrectPosition = function () {
                        var gridElement = $('.ui-grid-viewport');
                        var gridPosition = {
                            width: gridElement.outerWidth(),
                            height: gridElement.outerHeight(),
                            offset: gridElement.offset()
                        };

                        var cellElement = $($elm);
                        var cellPosition = {
                            width: cellElement.outerWidth(),
                            height: cellElement.outerHeight(),
                            offset: cellElement.offset()
                        };

                        var datepickerElement = $('ul', cellElement);
                        var datepickerPosition = {
                            width: datepickerElement.outerWidth(),
                            height: datepickerElement.outerHeight()
                        };
                        var newOffsetValues = {};

                        var isFreeOnRight = (gridPosition.width - (cellPosition.offset.left - gridPosition.offset.left) - cellPosition.width) > datepickerPosition.width;
                        if (isFreeOnRight) {
                            newOffsetValues.left = cellPosition.offset.left + cellPosition.width;
                        } else {
                            newOffsetValues.left = cellPosition.offset.left - datepickerPosition.width;
                        }

                        datepickerElement.offset(newOffsetValues);
                        datepickerElement.css("visibility", "visible");
                    };

                    $timeout(function () {
                        setCorrectPosition();
                    }, 0);

                    $scope.isOpen = true;

                    var uiGridCtrl = controllers[0];
                    var renderContainerCtrl = controllers[1];

                    var onWindowClick = function (evt) {
                        var classNamed = angular.element(evt.target).attr('class');
                        var inDatepicker = (classNamed.indexOf('datepicker-calendar') > -1);
                        if (!inDatepicker && evt.target.nodeName !== "INPUT") {
                            $scope.stopEdit(evt);
                        }
                    };

                    var onCellClick = function (evt) {
                        console.log('click')
                        angular.element(document.querySelectorAll('.ui-grid-cell-contents')).off('click', onCellClick);
                        $scope.stopEdit(evt);
                    };

                    $scope.changeDate = function (evt) {
                        $scope.stopEdit(evt);
                    };

                    $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                        if (uiGridCtrl.grid.api.cellNav) {
                            uiGridCtrl.grid.api.cellNav.on.navigate($scope, function (newRowCol, oldRowCol) {
                                $scope.stopEdit();
                            });
                        } else {
                            angular.element(document.querySelectorAll('.ui-grid-cell-contents')).on('click', onCellClick);
                        }
                        angular.element(window).on('click', onWindowClick);
                    });

                    $scope.$on('$destroy', function () {
                        angular.element(window).off('click', onWindowClick);
                    });

                    $scope.stopEdit = function (evt) {
                        $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                    };

                    $elm.on('keydown', function (evt) {
                        switch (evt.keyCode) {
                            case uiGridConstants.keymap.ESC:
                                evt.stopPropagation();
                                $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                                break;
                        }
                        if (uiGridCtrl && uiGridCtrl.grid.api.cellNav) {
                            evt.uiGridTargetRenderContainerId = renderContainerCtrl.containerId;
                            if (uiGridCtrl.cellNav.handleKeyDown(evt) !== null) {
                                $scope.stopEdit(evt);
                            }
                        } else {
                            switch (evt.keyCode) {
                                case uiGridConstants.keymap.ENTER:
                                case uiGridConstants.keymap.TAB:
                                    evt.stopPropagation();
                                    evt.preventDefault();
                                    $scope.stopEdit(evt);
                                    break;
                            }
                        }
                        return true;
                    });
                }
            };
        }
    };
}]);


/* start javascript function*/
function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}


function SetProperString(d) {

    if (d == null) return '';
    return (d.length ? "'" + d.join("','") + "'" : "");
}

function validateEmail(email) {
    //var re = /^(([^<>()\[\]\\.,;:\s@@"]+(\.[^<>()\[\]\\.,;:\s@@"]+)*)|(".+"))@@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var re = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
    return re.test(email);
}

function validateUrl(Url) {
    var re = /(https?:\/\/)?([\w\d]+\.)?[\w\d]+\.\w+\/?.+/;
    return re.test(Url);
}

function DiffDate(StartDate, EndDate) {
    if (StartDate == null || StartDate == "" || EndDate == null || EndDate == "") {
        return 0;
    }
    var date1 = new Date(StartDate);
    var date2 = new Date(EndDate);
    var timeDiff = date2.getTime() - date1.getTime();
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays;
}

/*  Push Json Object Function Start */

/* Example Start

    json1 = [{id:2, name: 'xyz'}],
    json2 = [{ id: 3, name: 'xyy' }],
    $.concat(json1, json2);

   Example End */

(function ($) { $.concat || $.extend({ concat: function (b, c) { var a = []; for (var x in arguments) if (typeof a == 'object') a = a.concat(arguments[x]); return a } }); })(jQuery);

/*  Push Json Object Function End */


/*
    Json Where Query Angularjs
    
    jsondata = [{id:2, name: 'xyz'}],

    var data = $filter('filter')(jsondata, function (o) {
        return o.id == 2 || o.id == 3;
    });

*/



















































































/*Start Beta version */



function TempGriedAddRow($scope) {
    var filed = {};
    $scope.gridOptions.columnDefs.forEach(function (h) {
        filed[h.field] = ''
    });
    $scope.gridOptions.data.push(filed)
}


function TempGriedFill($scope, $http, $q, $interval, uiGridConstants, URL, header, SavePostDataURL, GridOptionName) {
    var paginationOptions = {
        pageNumber: 1,
        iDisplayStart: 0,
        iDisplayLength: 25,
        sSearch: sSearch,
        iSortCols: null
    };
    $scope.RunTimeChecked = false;

    $scope[GridOptionName] = {
        paginationPageSizes: [5, 25, 50, 75],
        paginationPageSize: paginationOptions.iDisplayLength,
        useExternalPagination: true,
        useExternalSorting: true,
        //  enableFiltering: true,
        useExternalFiltering: true,
        enableColumnResizing: true,
        //  showColumnFooter: true,
        columnDefs:
           header
        ,
        /* START Grid Option  */
        enableGridMenu: true,
        // enableSelectAll: true,
        // exporterMenuPdf: false, // ADD THIS
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: { fontSize: 9 },
        exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
        exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
        exporterPdfHeader: { text: "My Header", style: 'headerStyle' },

        exporterPdfFooter: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
            docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
            return docDefinition;
        },
        exporterPdfOrientation: 'portrait',
        exporterPdfPageSize: 'A4',
        exporterPdfMaxGridWidth: 500,
        exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),

        /* END Grid Option  */
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                $scope.$apply();
                $scope.UpdateChangeCalcu(rowEntity);
            });
            $scope.gridApi.core.on.filterChanged($scope, function () {
                var grid = this.grid;
                paginationOptions.sSearch = "";
                for (var i = 0; i < grid.columns.length; i++) {
                    if (grid.columns[i].filters[0].term != undefined) {
                        paginationOptions.sSearch += " AND " + grid.columns[i].colDef["field"] + " like '%" + grid.columns[i].filters[0].term + "%'";
                    }
                }
                getPage()
            });
            $scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                if (sortColumns.length == 0) {
                    paginationOptions.iSortCols = null;
                } else {
                    paginationOptions.iSortCols = " Order By " + sortColumns[0].field + " " + sortColumns[0].sort.direction;
                }
                getPage();
            });
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                paginationOptions.pageNumber = newPage;
                paginationOptions.iDisplayLength = pageSize;
                getPage();
            });

            gridApi.core.on.renderingComplete($scope, function () {

                if (CallBack != 0) {
                    $scope.CallBack();
                }

            });
        }
    };



    var saveRow = function (rowEntity) {
        // create a fake promise - normally you'd use the promise returned by $http or $resource
        var promise = $q.defer();
        $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);

        $interval(function () {
            // if ($scope.RunTimeChecked) {
            var response = $http({
                method: "post",
                async: true,
                url: SavePostDataURL,//'@Url.Action("UpdateStoneMaster", "Utility")',
                data: rowEntity,
                dataType: "json"
            });
            //return response;
            //if (rowEntity.gender === 'male') {
            //    promise.reject();
            //} else {
            //    promise.resolve();
            //}
            //}
        }, 3000, 1);
    };
    var getPage = function () {
        var url = URL;//'@Url.Action("GetAllData", "Utility")';

        var data = {
            pageNumber: paginationOptions.pageNumber,
            iDisplayLength: paginationOptions.iDisplayLength,
            iDisplayStart: (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength,
            sSearch: paginationOptions.sSearch,
            iSortCols: paginationOptions.iSortCols
        };

        var config = {
            params: data,
            headers: { 'Accept': 'application/json' }
        };
        $http.get(url, config).success(function (data) {
            $scope[GridOptionName].totalItems = data.iTotalDisplayRecords;
            // var firstRow = (paginationOptions.pageNumber - 1) * paginationOptions.pageSize;//pagesize==iDisplayLength
            paginationOptions.iDisplayStart = (paginationOptions.pageNumber - 1) * paginationOptions.iDisplayLength;

            $scope[GridOptionName].data = data.aaData;
            //$scope.gridOptions.data = data.aaData.slice(firstRow, firstRow + paginationOptions.pageSize);
            // reSize(data.aaData.length);

            //$scope.height = (($scope[GridOptionName].data.length * 30) + 30);

            //$scope.height += 80;


        });

    };

    getPage();
}

function ConvertDate(dateValue) {
    var dateString = dateValue.substr(6);
    var currentTime = new Date(parseInt(dateString));
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var date = day + "/" + monthNames[month] + "/" + year;

    return date;
}
function DotnetTojson(DateString) {
    var date = "";
    try {
        date = DateString.replace(/\/Date\((-?\d+)\)\//, '$1')
    } catch (e) {
        console.log("date string invalid");
    }
    return date;
    // var d = new Date(parseInt(milli));
}
Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};

function fnNumPadLeft(num, places) {

    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}





















/*End Beta version */
/*Start  Globally Gried Dropdown*/
//var ParameterToleranceType = [{
//    id: 4,
//    value: 'Value'
//}, {
//    id: 5,
//    value: 'Percentage'
//}];

/* Globally Gried Dropdown*/

/*End Beta version */















/*test question arise on rnd*/
//$scope.gridApi.rowEdit.flushDirtyRows( $scope.gridApi.grid );//check time on update data only get?? //http://plnkr.co/edit/s583DdMHjxkf3yf6Gi7y?p=preview
//easily show popup value http://plnkr.co/edit/D48xcomnXdClccMnl5Jj?p=preview
//datetimepicker used this http://plnkr.co/edit/4mNr86cN6wFOLYQ02QND
//FOR WITHOUT OPTION SELECION GET VALUE GOOD EXAMPLE http://jsfiddle.net/mLrynxh2/2/
//direct se\t http://plnkr.co/edit/x4JAeXra1bP4cQjIBld0?p=preview
//http://plnkr.co/edit/4mNr86cN6wFOLYQ02QND?p=preview

//http://plnkr.co/edit/c0EIopXUgnoNQDyxzbot?p=preview
//aUTOrESIZE
//http://plnkr.co/edit/96o8ZemeM1IG8CpaXwV2?p=preview
//http://plnkr.co/edit/H1B3rKrMM4RaUH5SPVaF?p=preview
//http://plnkr.co/edit/mEyS1MqJIiRdDJHn5OI1?p=preview
