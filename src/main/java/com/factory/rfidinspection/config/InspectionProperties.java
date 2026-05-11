package com.factory.rfidinspection.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "inspection")
public record InspectionProperties(String readerName) {
}
