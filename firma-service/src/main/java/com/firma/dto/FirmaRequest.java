package com.firma.dto;

public class FirmaRequest {

    private String src;
    private String dest;
    private String cert;
    private String password;
    private float x;
    private float y;

    public String getSrc() { return src; }
    public void setSrc(String src) { this.src = src; }

    public String getDest() { return dest; }
    public void setDest(String dest) { this.dest = dest; }

    public String getCert() { return cert; }
    public void setCert(String cert) { this.cert = cert; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public float getX() { return x; }
    public void setX(float x) { this.x = x; }

    public float getY() { return y; }
    public void setY(float y) { this.y = y; }
}