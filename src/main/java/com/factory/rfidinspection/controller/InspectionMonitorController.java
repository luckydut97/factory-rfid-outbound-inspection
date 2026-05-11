package com.factory.rfidinspection.controller;

import com.factory.rfidinspection.service.InspectionConfigService;
import com.factory.rfidinspection.service.InspectionCurrentStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/inspection")
@RequiredArgsConstructor
public class InspectionMonitorController {

    private final InspectionCurrentStatusService inspectionCurrentStatusService;
    private final InspectionConfigService inspectionConfigService;

    @GetMapping("/current")
    public InspectionCurrentStatusService.InspectionCurrentStatus getCurrentStatus() {
        return inspectionCurrentStatusService.getCurrentStatus();
    }

    @GetMapping("/config")
    public InspectionConfigService.InspectionConfigSnapshot getConfig() {
        return inspectionConfigService.getCurrentConfig();
    }
}
