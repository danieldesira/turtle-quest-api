-- CreateTable
CREATE TABLE "players_sso_providers" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER NOT NULL,
    "sso_provider" VARCHAR NOT NULL,
    "external_id" VARCHAR NOT NULL,

    CONSTRAINT "players_sso_provider_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "players_sso_providers" ADD CONSTRAINT "players_sso_providers_fk" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;