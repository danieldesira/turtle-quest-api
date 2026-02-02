-- CreateTable
CREATE TABLE "outcomes" (
    "id" SERIAL NOT NULL,
    "desc" VARCHAR NOT NULL,

    CONSTRAINT "outcomes_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "name" VARCHAR(128),
    "date_of_birth" DATE,
    "external_id" VARCHAR NOT NULL,
    "sso_platform" VARCHAR NOT NULL,
    "profile_pic_r2_key" VARCHAR,
    "last_game" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL,
    "last_login_at" TIMESTAMP(6),
    "email" VARCHAR NOT NULL,
    "settings" JSON,
    "id" SERIAL NOT NULL,
    "last_game_saved_on" TIMESTAMP(6),

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "points" INTEGER NOT NULL,
    "level" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "player_id" INTEGER,
    "id" SERIAL NOT NULL,
    "outcome_id" INTEGER NOT NULL,

    CONSTRAINT "score_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_unique" ON "players"("email");

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "score_outcomes_fk" FOREIGN KEY ("outcome_id") REFERENCES "outcomes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "score_player_fk" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
