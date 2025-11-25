package main

import (
	"github.com/StutenEXE/comics-backend/middleware"
	"github.com/StutenEXE/comics-backend/services"
	"github.com/gin-gonic/gin"
)

func startRouter() {
	// Initialize Gin router
	r := gin.Default()

	// Setup public routes
	public := r.Group("/api/comics/pub")
	{
		// User services
		public.POST("/login", services.LoginService)
		public.POST("/signup", services.CreateUserService)
		// Book services
		public.GET("/books/latest", services.GetLatestBooks)

	}

	// Setup protected routes
	protected := r.Group("/api/comics/pr")
	protected.Use(middleware.SessionAuth())
	{

	}

	// Start server
	r.Run(":8080")
}
