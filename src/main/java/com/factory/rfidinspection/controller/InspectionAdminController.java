package com.factory.rfidinspection.controller;

import com.factory.rfidinspection.service.InspectionAdminService;
import com.factory.rfidinspection.service.InspectionConfigService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/inspection")
@RequiredArgsConstructor
public class InspectionAdminController {

    private final InspectionAdminService inspectionAdminService;
    private final InspectionConfigService inspectionConfigService;

    @PutMapping("/config")
    public InspectionConfigService.InspectionConfigSnapshot updateConfig(@Valid @RequestBody ConfigUpdateRequest request) {
        return inspectionConfigService.updateConfig(request.toCommand());
    }

    @PostMapping("/simulate/manual-tags")
    public void simulateManualTags(@Valid @RequestBody ManualTagSimulationRequest request) {
        inspectionAdminService.insertManualTags(request.readerName(), request.antName(), request.tags());
    }

    @PostMapping("/simulate/scenario")
    public void simulateScenario(@Valid @RequestBody ScenarioSimulationRequest request) {
        inspectionAdminService.insertScenario(request.readerName(), request.scenario());
    }

    @PostMapping("/reset")
    public void resetInspectionData() {
        inspectionAdminService.resetInspectionData();
    }

    @PostMapping("/retry")
    public void retryFailedTransmission() {
        inspectionAdminService.retryFailedTransmission();
    }

    public record ConfigUpdateRequest(
            @NotBlank String readerName,
            @Min(1) Integer baseCount,
            @Min(1) Integer readWindowSec,
            @Min(1) Integer stableSec,
            @Min(1) Integer exitWaitSec,
            @Min(1) Integer resetSec,
            String apiUrl,
            @Min(1) Integer apiTimeoutSec
    ) {
        public InspectionConfigService.ConfigUpdateCommand toCommand() {
            return new InspectionConfigService.ConfigUpdateCommand(
                    readerName,
                    baseCount,
                    readWindowSec,
                    stableSec,
                    exitWaitSec,
                    resetSec,
                    apiUrl,
                    apiTimeoutSec
            );
        }
    }

    public record ManualTagSimulationRequest(
            @NotBlank String readerName,
            @NotBlank String antName,
            @NotEmpty List<@NotBlank String> tags
    ) {
    }

    public record ScenarioSimulationRequest(
            @NotBlank String readerName,
            @NotBlank String scenario
    ) {
    }
}
