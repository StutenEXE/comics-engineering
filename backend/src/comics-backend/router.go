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
		public.GET("/books", services.GetBookByID)
		public.GET("/books/serie", services.GetBooksBySerieID)
		public.GET("/books/latest", services.GetLatestBooks)
		// Edition services
		public.GET("/editions", services.GetEditionByID)
		// Issue serie services
		public.GET("/issueseries", services.GetIssueSerieByID)
		// Issue services
		public.GET("/issues", services.GetIssueByID)
		public.GET("/issues/book", services.GetIssueByBookID)
		// Publisher services
		public.GET("/publishers", services.GetPublisherByID)
		// Serie services
		public.GET("/series", services.GetSerieByID)

		// Search services
		public.GET("/search/books_and_series", services.SearchBooksAndSeries)
	}

	// Setup protected routes
	protected := r.Group("/api/comics/prv")
	protected.Use(middleware.SessionAuth())
	{

	}

	// Start server
	r.Run(":8080")
}
