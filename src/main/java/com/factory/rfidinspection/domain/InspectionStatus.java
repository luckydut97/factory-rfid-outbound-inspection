package com.factory.rfidinspection.domain;

public enum InspectionStatus {
    READY,
    DETECTING,
    STABLE_CHECK,
    CONFIRMED,
    API_SENDING,
    API_SENT,
    API_FAILED,
    EXIT_WAIT,
    RESET_WAIT,
    TYPE_AMBIGUOUS
}
