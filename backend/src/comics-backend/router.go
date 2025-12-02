package main

import (
	"time"

	"github.com/StutenEXE/comics-backend/middleware"
	"github.com/StutenEXE/comics-backend/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// https://stackoverflow.com/questions/72086521/cross-origin-request-blocked-while-working-with-go
func CorsAllowAll() gin.HandlerFunc {
	cfg := cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "http://localhost:3000"}, // Vite dev server and others
		// AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	return cors.New(cfg)
}

func startRouter() {
	// Initialize Gin router
	r := gin.Default()
	r.Use(CorsAllowAll())

	// Setup public routes
	public := r.Group("/api/comics/pub")
	{
		// User services
		public.POST("/login", services.LoginService)
		public.POST("/signup", services.CreateUserService)
		// Book services
		public.GET("/book", services.GetBookByID)
		public.GET("/books/latest", services.GetLatestBooks)

	}

	// Setup protected routes
	protected := r.Group("/api/comics/prv")
	protected.Use(middleware.SessionAuth())
	{

	}

	// Start server
	r.Run(":8080")
}
