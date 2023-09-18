export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      moves: {
        Row: {
          game_id: string;
          id: string;
          move: "rock" | "paper" | "scissors";
          player_id: string;
        };
        Insert: {
          game_id: string;
          id?: string;
          move: "rock" | "paper" | "scissors";
          player_id?: string;
        };
        Relationships: [];
      };
    };
  };
}
