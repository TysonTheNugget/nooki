// src/components/OrdinookiCard.js
import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  width: 300px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const OrdinookiImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 10px;
`;

const HealthBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #ddd;
  border-radius: 10px;
  margin: 10px 0;
`;

const HealthFill = styled.div`
  width: ${props => props.health}%;
  height: 100%;
  background-color: #4caf50;
  border-radius: 10px;
`;

const Stats = styled.div`
  margin-top: 10px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
`;

const OrdinookiCard = ({ ordinooki, health }) => {
  const { meta, id } = ordinooki;
  const imageUrl = `https://ordinals.com/content/${id}`;

  return (
    <CardContainer>
      <OrdinookiImage src={imageUrl} alt={meta.name} />
      <HealthBar>
        <HealthFill health={(health / meta.stats.HP) * 100} />
      </HealthBar>
      <Stats>
        <StatItem>
          <span>HP:</span> <span>{health}</span>
        </StatItem>
        <StatItem>
          <span>Attack:</span> <span>{meta.stats.Attack}</span>
        </StatItem>
        <StatItem>
          <span>Defense:</span> <span>{meta.stats.Defense}</span>
        </StatItem>
        <StatItem>
          <span>Speed:</span> <span>{meta.stats.Speed}</span>
        </StatItem>
        <StatItem>
          <span>Critical Chance:</span> <span>{meta.stats['Critical Chance']}</span>
        </StatItem>
      </Stats>
    </CardContainer>
  );
};

export default OrdinookiCard;
