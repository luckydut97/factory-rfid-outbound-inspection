package com.factory.rfidinspection.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(InspectionProperties.class)
public class InspectionConfig {
}
