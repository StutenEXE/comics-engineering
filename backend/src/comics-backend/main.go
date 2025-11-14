package main

import (
	"log"
	"os"
	"strconv"

	"github.com/StutenEXE/comics-backend/database"
	"github.com/StutenEXE/comics-backend/middleware"
	"github.com/StutenEXE/comics-backend/services"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Initialize env variables
	if err := godotenv.Load(".env"); err != nil {
		log.Println("no .env file found (that's OK in production)")
	}

	// Initialize Redis
	redisURL := os.Getenv("COMICS_REDIS_URL")
	redisPwd := os.Getenv("COMICS_REDIS_PASSWORD")
	redisDB, _ := strconv.Atoi(os.Getenv("COMICS_REDIS_DB"))
	middleware.InitRedis(redisURL, redisPwd, redisDB)

	// Initialize PostgreSQL
	pgURL := os.Getenv("COMICS_PG_URL")
	pgUser := os.Getenv("COMICS_PG_USER")
	pgPwd := os.Getenv("COMICS_PG_PASSWORD")
	pgDb := os.Getenv("COMICS_PG_DB")
	if err := database.InitPostgreSQL(pgURL, pgUser, pgPwd, pgDb); err != nil {
		log.Fatalf("failed to initialize PostgreSQL: %v", err)
	}

	// Initialize Gin router
	r := gin.Default()

	// Setup public routes
	public := r.Group("/api/comics/pub")
	{
		public.POST("/login", services.LoginService)
		public.POST("/signup", services.CreateUserService)
	}

	// Setup protected routes
	protected := r.Group("/api/comics/pr")
	protected.Use(middleware.SessionAuth())
	{

	}

	r.Run(":8080")
}
