use anchor_lang::prelude::*;

declare_id!("BfMrgcrKq3aoZ1a725ZtDij5PaiEMFi6oRvCuHYtZh4G");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod favorites {
    use super::*;

    pub fn set_favorites(
        ctx: Context<SetFavorites>,
        number: u64,
        color: String,
        hobbies: Vec<String>,
    ) -> Result<()> {
        let user_public_key = ctx.accounts.user.key();
        msg!("Greetings from {}", ctx.program_id);
        msg!("User {user_public_key}'s favorite number is {number}, favorite color is: {color} and their hobbies are: {hobbies:?}",);

        ctx.accounts.favorites.set_inner(Favorites {
            number,
            color,
            hobbies,
        });

        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u64,

    #[max_len(50)]
    pub color: String,

    #[max_len(5, 50)]
    pub hobbies: Vec<String>,
}

#[derive(Accounts)]
pub struct SetFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
        seeds = [b"favorites", user.key().as_ref()],
        bump
    )]
    pub favorites: Account<'info, Favorites>,

    pub system_program: Program<'info, System>,
}
