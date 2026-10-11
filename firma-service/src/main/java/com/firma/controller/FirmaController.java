package com.firma.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.firma.service.FirmaService;
import com.firma.dto.FirmaRequest;

@RestController
@RequestMapping("/api/firmar")
public class FirmaController {

    private final FirmaService firmaService;

    public FirmaController(FirmaService firmaService) {
        this.firmaService = firmaService;
    }

    @PostMapping
    public ResponseEntity<?> firmar(@RequestBody FirmaRequest req) {

        try {

            firmaService.firmar(
                    req.getSrc(),
                    req.getDest(),
                    req.getCert(),
                    req.getPassword(),
                    req.getX(),
                    req.getY()
            );

            return ResponseEntity.ok("PDF firmado correctamente");

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}